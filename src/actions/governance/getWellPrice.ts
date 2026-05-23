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
  if (!mWELL || !oracle) return 0n;
  return await oracle.read.getUnderlyingPrice([mWELL]);
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
 * Returns 0n if the lookup fails.
 */
export async function getGovernanceTokenPriceFor(
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
