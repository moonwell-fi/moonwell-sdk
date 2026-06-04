import type { PublicClient } from "viem";

/**
 * Cap on interpolation iterations before falling back to binary search. With
 * near-linear `ts(block)` the interpolation phase converges in ~3–5 reads.
 * On chains whose block time changed over their history the projection can
 * fail to converge at all — see the binary completion phase below.
 */
const MAX_INTERPOLATION_ITERATIONS = 8;

/**
 * Find the block number on a chain whose timestamp is the latest one ≤ the target unix timestamp.
 *
 * Two phases:
 *
 * 1. Interpolation search anchored on the latest block and block 1: each iteration
 *    narrows the range by reading one block and projecting the target via the slope
 *    of the remaining range. Converges in ~3–5 RPC calls on chains with a roughly
 *    constant block time.
 * 2. Binary-search completion: if interpolation hasn't converged after
 *    `MAX_INTERPOLATION_ITERATIONS`, finish with plain bisection — guaranteed
 *    convergence in ~log2(remaining range) reads.
 *
 * The completion phase is load-bearing, not defensive: on Moonbeam the block time
 * changed ~12s → ~6s (async backing), so the interpolated projection — whose slope
 * is the all-history average — lands after the target on every probe. Only the
 * upper bound moves, the lower bound never leaves block 1, and the previous
 * implementation silently returned that unconverged bound. Voting-power reads then
 * executed against a block years before the views contract existed and reverted
 * (governance proposal 171 incident, June 2026). An unconverged bound must never
 * be returned.
 *
 * Assumes block 1 exists on the chain — true for every EVM chain Moonwell supports.
 *
 * Returns the latest block if `targetTimestamp` is at or after the head, and block 1
 * if it is before block 1's timestamp. On a chain with only block 0, returns block 0.
 */
export async function getBlockNumberAtTimestamp(
  publicClient: PublicClient,
  targetTimestamp: bigint,
): Promise<bigint> {
  const latest = await publicClient.getBlock({ blockTag: "latest" });
  if (targetTimestamp >= latest.timestamp) return latest.number;
  if (latest.number === 0n) return latest.number;

  const first = await publicClient.getBlock({ blockNumber: 1n });
  if (targetTimestamp <= first.timestamp) return first.number;

  // Invariant throughout: ts(lo) <= targetTimestamp < ts(hi).
  let lo = first.number;
  let loTs = first.timestamp;
  let hi = latest.number;
  let hiTs = latest.timestamp;

  for (let i = 0; i < MAX_INTERPOLATION_ITERATIONS; i += 1) {
    if (hi - lo <= 1n) break;
    const tsRange = hiTs - loTs;
    if (tsRange <= 0n) break;

    const offset = ((targetTimestamp - loTs) * (hi - lo)) / tsRange;
    let mid = lo + offset;
    if (mid <= lo) mid = lo + 1n;
    if (mid >= hi) mid = hi - 1n;

    const block = await publicClient.getBlock({ blockNumber: mid });
    if (block.timestamp <= targetTimestamp) {
      lo = mid;
      loTs = block.timestamp;
    } else {
      hi = mid;
      hiTs = block.timestamp;
    }
  }

  // Binary completion: never return an unconverged bound.
  while (hi - lo > 1n) {
    const mid = (lo + hi) / 2n;
    const block = await publicClient.getBlock({ blockNumber: mid });
    if (block.timestamp <= targetTimestamp) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return lo;
}
