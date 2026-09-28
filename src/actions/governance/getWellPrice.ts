import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";

/**
 * Reads WELL/USD from Base's lending oracle via getUnderlyingPrice(mWELL).
 *
 * The Base oracle is Chainlink-fed and shared by the lending markets, so it's
 * the authoritative WELL/USD source. Used in place of the per-chain
 * views.getGovernanceTokenPrice() which is unreliable on Moonbeam (returns
 * stale data) and Base (returns 0).
 *
 * Returns a uint256 already scaled to 18 decimals.
 *
 * @param baseEnvironment Pass the caller's Base environment when available so
 *   user-configured RPCs / onError handlers are honored. Falls back to the
 *   SDK's default public Base environment otherwise.
 */
export async function getWellPriceFromBaseOracle(
  baseEnvironment?: Environment,
): Promise<bigint> {
  const baseEnv = baseEnvironment ?? publicEnvironments.base;
  const tokens = baseEnv.config.tokens as Record<
    string,
    { address: `0x${string}` } | undefined
  >;
  const mWELL = tokens.MOONWELL_WELL?.address;
  const oracle = baseEnv.contracts.oracle;
  if (!mWELL || !oracle) {
    // A custom Base env without MOONWELL_WELL or an oracle would silently
    // zero out every WELL-priced read across the SDK. Surface it instead.
    baseEnv.onError?.(
      new Error(
        `getWellPriceFromBaseOracle: missing ${!mWELL ? "MOONWELL_WELL token" : "oracle contract"} on Base env`,
      ),
      { source: "well-price", chainId: baseEnv.chainId },
    );
    return 0n;
  }
  return await oracle.read.getUnderlyingPrice([mWELL]);
}

async function readGovernanceTokenPrice(
  environment: Environment,
  baseEnvironment?: Environment,
): Promise<bigint> {
  if (environment.custom?.governance?.token === "WELL") {
    return getWellPriceFromBaseOracle(baseEnvironment);
  }
  // Non-WELL (e.g. Moonriver / MFAM): the env itself is the governance "home".
  const views = environment.contracts.views;
  if (!views) return 0n;
  return (await views.read.getGovernanceTokenPrice()) ?? 0n;
}

const GOVERNANCE_TOKEN_PRICE_TTL_MS = 10_000;

type GovernanceTokenPriceEntry = {
  promise: Promise<bigint>;
  expiresAt: number;
  requestingChainIds: Set<number>;
  reported: boolean;
};

// Keyed by the chain the price is read from (Base for every WELL chain), so
// markets, vaults, rewards and staking reads issued together share one request.
const governanceTokenPriceCache = new Map<number, GovernanceTokenPriceEntry>();

function getSharedGovernanceTokenPrice(
  environment: Environment,
  baseEnvironment?: Environment,
): { sourceChainId: number; entry: GovernanceTokenPriceEntry } {
  const sourceChainId =
    environment.custom?.governance?.token === "WELL"
      ? (baseEnvironment ?? publicEnvironments.base).chainId
      : environment.chainId;

  const cached = governanceTokenPriceCache.get(sourceChainId);
  if (cached && Date.now() < cached.expiresAt) {
    cached.requestingChainIds.add(environment.chainId);
    return { sourceChainId, entry: cached };
  }

  const entry: GovernanceTokenPriceEntry = {
    promise: readGovernanceTokenPrice(environment, baseEnvironment),
    expiresAt: Date.now() + GOVERNANCE_TOKEN_PRICE_TTL_MS,
    requestingChainIds: new Set([environment.chainId]),
    reported: false,
  };
  governanceTokenPriceCache.set(sourceChainId, entry);
  // Failures are never cached: evict so the next call reads again.
  entry.promise.catch(() => {
    if (governanceTokenPriceCache.get(sourceChainId) === entry) {
      governanceTokenPriceCache.delete(sourceChainId);
    }
  });
  return { sourceChainId, entry };
}

/**
 * Returns the governance-token-in-USD price for an environment.
 *
 * - For WELL-governed chains (Base, Optimism, Moonbeam), reads from the Base
 *   lending oracle's mWELL underlying price (authoritative, Chainlink-fed).
 * - For non-WELL chains (currently only Moonriver / MFAM), reads from the
 *   env's own views.getGovernanceTokenPrice() — Moonriver has its own MFAM
 *   oracle and isn't priced from Base.
 *
 * Concurrent calls for the same price source share one in-flight read, and a
 * successful price is reused for a few seconds. Rejects if the read fails.
 */
export async function getGovernanceTokenPriceFor(
  environment: Environment,
  baseEnvironment?: Environment,
): Promise<bigint> {
  return getSharedGovernanceTokenPrice(environment, baseEnvironment).entry
    .promise;
}

/**
 * Same shared read as `getGovernanceTokenPriceFor`, but resolves to 0n on
 * failure. A failed shared read is reported through `onError` once, however
 * many callers were waiting on it; `items` lists the requesting chainIds.
 */
export async function getGovernanceTokenPriceOrZero(
  environment: Environment,
  baseEnvironment?: Environment,
): Promise<bigint> {
  const { sourceChainId, entry } = getSharedGovernanceTokenPrice(
    environment,
    baseEnvironment,
  );
  try {
    return await entry.promise;
  } catch (error) {
    if (!entry.reported) {
      entry.reported = true;
      environment.onError?.(error, {
        source: "governance-token-price",
        chainId: sourceChainId,
        operation: "governance-token-price-read",
        items: [...entry.requestingChainIds].map(String),
      });
    }
    return 0n;
  }
}
