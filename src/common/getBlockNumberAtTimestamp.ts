import type { PublicClient } from "viem";

/**
 * Safety cap on interpolation iterations. With near-linear `ts(block)` the search
 * converges in ~3–5 reads; 8 leaves headroom for chains with variable block times
 * (e.g. Moonbeam) without unbounded RPC fan-out on pathological inputs.
 */
const MAX_ITERATIONS = 8;

/**
 * Find the block number on a chain whose timestamp is the latest one ≤ the target unix timestamp.
 *
 * Uses interpolation search anchored on the latest block and block 1: each iteration
 * narrows the range by reading one block and projecting the target via the slope of the
 * remaining range. Converges in ~3–5 RPC calls even on chains with variable block times.
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

  let lo = first.number;
  let loTs = first.timestamp;
  let hi = latest.number;
  let hiTs = latest.timestamp;

  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
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

  return lo;
}
