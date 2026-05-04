import type { PublicClient } from "viem";

/**
 * Find the block number on a chain whose timestamp is the latest one ≤ the target unix timestamp.
 *
 * Uses interpolation search anchored on the latest block and block 1: each iteration
 * narrows the range by reading one block and projecting the target via the slope of the
 * remaining range. Converges in ~3–5 RPC calls even on chains with variable block times.
 *
 * Returns the latest block if `targetTimestamp` is at or after the head, and block 1
 * (or 0 on chains with no block 1) if it is before chain genesis.
 */
export async function getBlockNumberAtTimestamp(
  publicClient: PublicClient,
  targetTimestamp: bigint,
): Promise<bigint> {
  const latest = await publicClient.getBlock({ blockTag: "latest" });
  if (targetTimestamp >= latest.timestamp) return latest.number;

  let lo = 0n;
  let loTs = 0n;
  let hi = latest.number;
  let hiTs = latest.timestamp;

  if (latest.number > 0n) {
    const first = await publicClient.getBlock({ blockNumber: 1n });
    if (targetTimestamp <= first.timestamp) return first.number;
    lo = first.number;
    loTs = first.timestamp;
  }

  for (let i = 0; i < 8; i += 1) {
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
