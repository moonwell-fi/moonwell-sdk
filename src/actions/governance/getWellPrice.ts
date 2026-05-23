import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";

/**
 * Reads WELL/USD from Base's lending oracle via getUnderlyingPrice(mWELL).
 *
 * Authoritative across all chains: the per-chain views.getGovernanceTokenPrice()
 * is unreliable (Moonbeam returns stale data, Base returns 0). The Base oracle
 * is Chainlink-fed and shared by the lending markets, so this is the same
 * source the rest of the protocol uses for mWELL pricing.
 *
 * Returns a uint256 already scaled to 18 decimals, matching the existing
 * Amount(_, 18) wrapping at call sites — no scaling change required downstream.
 */
export async function getWellPriceFromBase(
  client?: MoonwellClient,
): Promise<bigint> {
  const baseEnv =
    (client?.environments as { base?: Environment } | undefined)?.base ??
    publicEnvironments.base;
  const mWELL = baseEnv.config.tokens.MOONWELL_WELL?.address;
  const oracle = baseEnv.contracts.oracle;
  if (!mWELL || !oracle) return 0n;
  return (await oracle.read.getUnderlyingPrice([mWELL])) as bigint;
}
