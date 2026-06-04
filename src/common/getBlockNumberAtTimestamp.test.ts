import type { PublicClient } from "viem";
import { describe, expect, test, vi } from "vitest";
import { getBlockNumberAtTimestamp } from "./getBlockNumberAtTimestamp.js";

type Block = { number: bigint; timestamp: bigint };

/**
 * Build a mock viem PublicClient whose `getBlock` resolves against a fixed in-memory
 * map. `getBlock({ blockTag: "latest" })` returns the highest-numbered block; numeric
 * lookups fail for unknown blocks (mirroring real RPCs and surfacing test bugs).
 *
 * `getBlockSpy` exposes the underlying mock so tests can assert call counts.
 */
function makeClient(blocks: Block[]): {
  client: PublicClient;
  getBlockSpy: ReturnType<typeof vi.fn>;
} {
  const byNumber = new Map(blocks.map((b) => [b.number, b]));
  const latest = blocks.reduce((a, b) => (b.number > a.number ? b : a));

  const getBlockSpy = vi.fn(
    async ({
      blockTag,
      blockNumber,
    }: {
      blockTag?: "latest";
      blockNumber?: bigint;
    }) => {
      if (blockTag === "latest") return latest;
      if (blockNumber === undefined) {
        throw new Error("expected blockNumber or blockTag");
      }
      const block = byNumber.get(blockNumber);
      if (!block) {
        throw new Error(`mock has no block ${blockNumber}`);
      }
      return block;
    },
  );

  return {
    client: { getBlock: getBlockSpy } as unknown as PublicClient,
    getBlockSpy,
  };
}

describe("getBlockNumberAtTimestamp", () => {
  test("returns latest block when target >= latest.timestamp", async () => {
    const { client } = makeClient([
      { number: 0n, timestamp: 0n },
      { number: 1n, timestamp: 10n },
      { number: 100n, timestamp: 1000n },
    ]);

    expect(await getBlockNumberAtTimestamp(client, 1000n)).toBe(100n);
    expect(await getBlockNumberAtTimestamp(client, 9999n)).toBe(100n);
  });

  test("returns block 1 when target <= block-1 timestamp", async () => {
    const { client } = makeClient([
      { number: 0n, timestamp: 0n },
      { number: 1n, timestamp: 10n },
      { number: 100n, timestamp: 1000n },
    ]);

    expect(await getBlockNumberAtTimestamp(client, 10n)).toBe(1n);
    expect(await getBlockNumberAtTimestamp(client, 5n)).toBe(1n);
  });

  test("returns the largest block whose timestamp is <= target", async () => {
    // Linear: every block 10s apart, blocks 0..100, head = 100.
    const blocks: Block[] = Array.from({ length: 101 }, (_, i) => ({
      number: BigInt(i),
      timestamp: BigInt(i * 10),
    }));
    const { client } = makeClient(blocks);

    // Target lands between block 42 (ts=420) and block 43 (ts=430).
    expect(await getBlockNumberAtTimestamp(client, 425n)).toBe(42n);

    // Target lands exactly on a block timestamp.
    expect(await getBlockNumberAtTimestamp(client, 500n)).toBe(50n);
  });

  test("returns latest immediately on a single-block chain (only block 0)", async () => {
    const { client, getBlockSpy } = makeClient([
      { number: 0n, timestamp: 50n },
    ]);

    // Target before block-0 timestamp: function still returns block 0
    // (the chain has nothing earlier to resolve to).
    expect(await getBlockNumberAtTimestamp(client, 0n)).toBe(0n);
    // Only the `latest` lookup should be needed — no attempt to read block 1.
    expect(getBlockSpy).toHaveBeenCalledTimes(1);
  });

  test("converges within MAX_ITERATIONS on a 1M-block linear chain", async () => {
    const TOTAL_BLOCKS = 1_000_000n;
    const SECONDS_PER_BLOCK = 2n;
    const blocks: Block[] = [
      { number: 0n, timestamp: 0n },
      { number: 1n, timestamp: SECONDS_PER_BLOCK },
      { number: TOTAL_BLOCKS, timestamp: TOTAL_BLOCKS * SECONDS_PER_BLOCK },
    ];
    // Synthesize blocks lazily on demand so we don't materialize 1M entries.
    const byNumber = new Map(blocks.map((b) => [b.number, b]));
    const latest = blocks[2]!;
    const getBlockSpy = vi.fn(
      async ({
        blockTag,
        blockNumber,
      }: {
        blockTag?: "latest";
        blockNumber?: bigint;
      }) => {
        if (blockTag === "latest") return latest;
        if (blockNumber === undefined) {
          throw new Error("expected blockNumber or blockTag");
        }
        const cached = byNumber.get(blockNumber);
        if (cached) return cached;
        return {
          number: blockNumber,
          timestamp: blockNumber * SECONDS_PER_BLOCK,
        };
      },
    );
    const client = { getBlock: getBlockSpy } as unknown as PublicClient;

    // Target somewhere in the middle, in seconds.
    const target = 750_000n * SECONDS_PER_BLOCK;
    const result = await getBlockNumberAtTimestamp(client, target);

    // On a perfectly linear chain interpolation should land exactly on the target block.
    expect(result).toBe(750_000n);
    // 1 latest + 1 block-1 + at most 8 interpolation reads = 10.
    expect(getBlockSpy.mock.calls.length).toBeLessThanOrEqual(10);
  });

  test("handles variable block times (2s and 30s alternating gaps)", async () => {
    // Blocks 0..20 with alternating 2s/30s spacing.
    let ts = 0n;
    const blocks: Block[] = [];
    for (let i = 0n; i <= 20n; i += 1n) {
      blocks.push({ number: i, timestamp: ts });
      ts += i % 2n === 0n ? 2n : 30n;
    }
    const { client } = makeClient(blocks);

    // Find the timestamp of block 13 and search for a target one second after it;
    // expected return is block 13 (largest block whose timestamp ≤ target).
    const block13 = blocks[13]!;
    const result = await getBlockNumberAtTimestamp(
      client,
      block13.timestamp + 1n,
    );
    expect(result).toBe(13n);
  });

  /**
   * Build a lazily-synthesized chain whose block time is piecewise-constant:
   * `eras` is [firstBlock, secondsPerBlock][] in ascending block order. This is
   * the shape that defeats pure interpolation: the all-history average slope
   * differs from the local slope near the head, so every projected probe lands
   * on the same side of the target and one bound never moves.
   */
  function makeRegimeClient(
    genesisTs: bigint,
    head: bigint,
    eras: Array<[bigint, bigint]>,
  ): {
    client: PublicClient;
    getBlockSpy: ReturnType<typeof vi.fn>;
    timestampOf: (block: bigint) => bigint;
  } {
    const timestampOf = (block: bigint): bigint => {
      let ts = genesisTs;
      let prevBoundary = 1n;
      let prevSeconds = eras[0]?.[1] ?? 12n;
      for (const [firstBlock, seconds] of eras) {
        if (block < firstBlock) break;
        ts += (firstBlock - prevBoundary) * prevSeconds;
        prevBoundary = firstBlock;
        prevSeconds = seconds;
      }
      return ts + (block - prevBoundary) * prevSeconds;
    };

    const getBlockSpy = vi.fn(
      async ({
        blockTag,
        blockNumber,
      }: {
        blockTag?: "latest";
        blockNumber?: bigint;
      }) => {
        const number = blockTag === "latest" ? head : blockNumber;
        if (number === undefined) {
          throw new Error("expected blockNumber or blockTag");
        }
        return { number, timestamp: timestampOf(number) };
      },
    );

    return {
      client: { getBlock: getBlockSpy } as unknown as PublicClient,
      getBlockSpy,
      timestampOf,
    };
  }

  test("regression: Moonbeam-shaped 12s→6s regime change resolves a recent timestamp (proposal-171 incident)", async () => {
    // Moonbeam's real shape at incident time: ~10M blocks of 12s, then 6s
    // blocks to head ~15.9M. The pre-fix implementation returned block 1 for
    // any recent target: every interpolated probe overshot, only `hi` moved,
    // and the unconverged `lo` was returned silently.
    const { client, getBlockSpy, timestampOf } = makeRegimeClient(
      1_639_798_584n,
      15_887_017n,
      [
        [1n, 12n],
        [10_000_000n, 6n],
      ],
    );

    // ~5,400 six-second blocks before the head — the proposal-171 snapshot shape.
    const targetBlock = 15_881_617n;
    const result = await getBlockNumberAtTimestamp(
      client,
      timestampOf(targetBlock),
    );

    expect(result).toBe(targetBlock);
    // 2 anchors + 8 interpolation + ~24 binary completion reads.
    expect(getBlockSpy.mock.calls.length).toBeLessThanOrEqual(40);
  });

  test("invariant: ts(result) <= target < ts(result+1) across randomized block-time regimes", async () => {
    // Deterministic LCG so failures are reproducible.
    let seed = 0x5eedn % 2147483647n;
    const next = (max: bigint): bigint => {
      seed = (seed * 48271n) % 2147483647n;
      return seed % max;
    };

    for (let run = 0; run < 25; run += 1) {
      const eraCount = Number(next(4n)) + 1;
      const eras: Array<[bigint, bigint]> = [[1n, next(20n) + 1n]];
      let boundary = 1n;
      for (let e = 1; e < eraCount; e += 1) {
        boundary += next(4_000_000n) + 1n;
        eras.push([boundary, next(20n) + 1n]);
      }
      const head = boundary + next(6_000_000n) + 10n;
      const { client, timestampOf } = makeRegimeClient(1_000_000n, head, eras);

      const target =
        timestampOf(1n) + 1n + next(timestampOf(head) - timestampOf(1n) - 1n);
      const result = await getBlockNumberAtTimestamp(client, target);

      expect(
        timestampOf(result) <= target,
        `run ${run}: ts(result)=${timestampOf(result)} > target=${target}`,
      ).toBe(true);
      if (result < head) {
        expect(
          target < timestampOf(result + 1n),
          `run ${run}: target=${target} >= ts(result+1)=${timestampOf(result + 1n)}`,
        ).toBe(true);
      }
    }
  });
});
