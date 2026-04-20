import axios from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../test/client.js";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import type { Environment } from "../../environments/index.js";
import type { LunarStakingSnapshot } from "../lunar-indexer-client.js";
import { createLunarIndexerClient } from "../lunar-indexer-client.js";
import { getStakingSnapshots } from "./getStakingSnapshots.js";

// ---------------------------------------------------------------------------
// Module mock — save the real implementation so integration tests can restore it
// vi.hoisted() is evaluated before vi.mock, so 'saved' is accessible in the factory
// ---------------------------------------------------------------------------

const saved = vi.hoisted(() => ({
  createLunarIndexerClient: undefined as
    | typeof createLunarIndexerClient
    | undefined,
}));

vi.mock("../lunar-indexer-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../lunar-indexer-client.js")>();
  saved.createLunarIndexerClient = actual.createLunarIndexerClient;
  return { ...actual, createLunarIndexerClient: vi.fn() };
});

// ---------------------------------------------------------------------------
// Unit test helpers
// ---------------------------------------------------------------------------

const MOCK_LUNAR_URL = "https://mock-lunar.test";

const NO_MORE_PAGES = null as unknown as string;

function makeLunarStakingSnapshot(
  timestamp: number,
  overrides: Partial<LunarStakingSnapshot> = {},
): LunarStakingSnapshot {
  return {
    id: `8453-staking-${timestamp}`,
    chainId: 8453,
    stakingTokenAddress: "0xstkwell",
    timestamp,
    blockNumber: "12000000",
    totalStaked: "1000000",
    totalStakedUSD: "500000",
    wellPrice: "0.5",
    timeInterval: 86400,
    ...overrides,
  };
}

function makeDailySnapshots(
  count: number,
  baseTimestamp = 1700000000,
): LunarStakingSnapshot[] {
  return Array.from({ length: count }, (_, i) =>
    makeLunarStakingSnapshot(baseTimestamp + i * 86400),
  );
}

/** Minimal MoonwellClient with a base-like environment (has lunarIndexerUrl). */
function makeClient(lunarIndexerUrl?: string): MoonwellClient {
  return {
    environments: {
      base: {
        chainId: 8453,
        lunarIndexerUrl,
      } as unknown as Environment,
    },
  } as unknown as MoonwellClient;
}

const MOCK_PONDER_URL = "https://mock-ponder.test";

/** Minimal MoonwellClient simulating moonriver (no lunarIndexerUrl, no indexerUrl). */
function makeMoonriverClient(): MoonwellClient {
  return {
    environments: {
      moonriver: {
        chainId: 1285,
        lunarIndexerUrl: undefined,
        indexerUrl: undefined,
      } as unknown as Environment,
    },
  } as unknown as MoonwellClient;
}

/** Minimal MoonwellClient simulating moonriver with Ponder indexerUrl. */
function makeMoonriverClientWithPonder(): MoonwellClient {
  return {
    environments: {
      moonriver: {
        chainId: 1285,
        lunarIndexerUrl: undefined,
        indexerUrl: MOCK_PONDER_URL,
      } as unknown as Environment,
    },
  } as unknown as MoonwellClient;
}

// ---------------------------------------------------------------------------
// Integration tests — restore the real Lunar client so tests hit the real API
// ---------------------------------------------------------------------------

describe("Testing staking snapshots (integration)", () => {
  beforeEach(() => {
    vi.mocked(createLunarIndexerClient).mockImplementation((config) =>
      saved.createLunarIndexerClient!(config),
    );
  });

  test("Get staking snapshots (no args) returns empty array", async () => {
    const stakingSnapshots = await testClient.getStakingSnapshots();
    expect(stakingSnapshots).toBeDefined();
    expect(stakingSnapshots.length).toBe(0);
  });

  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasStaking = Boolean(
        (environment.contracts as any)?.stakingToken &&
          environment.lunarIndexerUrl,
      );

      test(`Get staking snapshots on ${chain.name}`, async () => {
        const stakingSnapshots = await testClient.getStakingSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(stakingSnapshots).toBeDefined();
        if (hasStaking) {
          expect(stakingSnapshots.length).toBeGreaterThan(0);
        } else {
          expect(stakingSnapshots.length).toBeGreaterThanOrEqual(0);
        }
      });

      test(`Get staking snapshots by chain id on ${chain.name}`, async () => {
        const stakingSnapshots = await testClient.getStakingSnapshots({
          chainId: chain.id,
        });
        expect(stakingSnapshots).toBeDefined();
        if (hasStaking) {
          expect(stakingSnapshots.length).toBeGreaterThan(0);
        } else {
          expect(stakingSnapshots.length).toBeGreaterThanOrEqual(0);
        }
      });

      test(`Get staking snapshots with period "1M" on ${chain.name}`, async () => {
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          period: "1M",
        });
        expect(Array.isArray(snapshots)).toBe(true);
      });

      test(`Get staking snapshots with period "3M" on ${chain.name}`, async () => {
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          period: "3M",
        });
        expect(Array.isArray(snapshots)).toBe(true);
      });

      test(`Get staking snapshots with period "1Y" on ${chain.name}`, async () => {
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          period: "1Y",
        });
        expect(Array.isArray(snapshots)).toBe(true);
      });

      test(`Get staking snapshots with period "ALL" on ${chain.name}`, async () => {
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          period: "ALL",
        });
        expect(Array.isArray(snapshots)).toBe(true);
      });

      test(`Get staking snapshots with custom time range on ${chain.name}`, async () => {
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          startTime: thirtyDaysAgo,
          endTime: now,
        });
        expect(Array.isArray(snapshots)).toBe(true);
      });

      test(`Staking snapshots are sorted ascending by timestamp on ${chain.name}`, async () => {
        const snapshots = await testClient.getStakingSnapshots<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          period: "3M",
        });
        for (let i = 1; i < snapshots.length; i++) {
          expect(snapshots[i].timestamp).toBeGreaterThanOrEqual(
            snapshots[i - 1].timestamp,
          );
        }
      });
    },
  );

  test("moonriver returns empty array (no Lunar Indexer URL)", async () => {
    const snapshots = await testClient.getStakingSnapshots<
      (typeof testClient.environments)["moonriver"]["chain"]
    >({
      network: "moonriver",
      period: "3M",
    });
    expect(Array.isArray(snapshots)).toBe(true);
    expect(snapshots).toHaveLength(0);
  });

  test("base returns staking snapshots via Lunar Indexer", async () => {
    const snapshots = await testClient.getStakingSnapshots<
      (typeof testClient.environments)["base"]["chain"]
    >({
      network: "base",
      period: "3M",
    });
    expect(snapshots.length).toBeGreaterThan(0);
  });

  test("moonbeam returns staking snapshots via Lunar Indexer", async () => {
    const snapshots = await testClient.getStakingSnapshots<
      (typeof testClient.environments)["moonbeam"]["chain"]
    >({
      network: "moonbeam",
      period: "3M",
    });
    expect(snapshots.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Unit / behavior tests — use mocked Lunar client and axios.post spy
// ---------------------------------------------------------------------------

describe("Testing staking snapshots (unit / behavior)", () => {
  const mockGetStakingSnapshotsFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createLunarIndexerClient).mockReturnValue({
      getStakingSnapshots: mockGetStakingSnapshotsFn,
    } as never);

    mockGetStakingSnapshotsFn.mockResolvedValue({
      results: [],
      nextCursor: NO_MORE_PAGES,
    });
  });

  // --- Per-chain routing ---

  test("calls Lunar Indexer for a chain with lunarIndexerUrl", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453 });

    expect(createLunarIndexerClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: MOCK_LUNAR_URL }),
    );
    expect(mockGetStakingSnapshotsFn).toHaveBeenCalled();
  });

  test("returns [] for moonriver (no lunarIndexerUrl)", async () => {
    const client = makeMoonriverClient();
    const result = await getStakingSnapshots(client, { chainId: 1285 });

    expect(createLunarIndexerClient).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("returns empty array when no environment matches", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getStakingSnapshots(client, { chainId: 99999 });
    expect(result).toEqual([]);
    expect(createLunarIndexerClient).not.toHaveBeenCalled();
  });

  // --- Granularity per period ---

  test('period "1M" → API receives granularity "6h"', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453, period: "1M" });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "6h" }),
    );
  });

  test('period "3M" → API receives granularity "1d"', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453, period: "3M" });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });

  test('period "1Y" → API receives granularity "1d" (7d is client-side)', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453, period: "1Y" });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });

  test('period "ALL" → API receives granularity "1d" (14d is client-side)', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453, period: "ALL" });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });

  // --- Client-side granularity thinning ---

  test('period "1Y" (7d thinning) keeps every 7th snapshot starting from oldest', async () => {
    const snapshots = makeDailySnapshots(28);
    mockGetStakingSnapshotsFn.mockResolvedValue({
      results: snapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getStakingSnapshots(client, {
      chainId: 8453,
      period: "1Y",
    });

    // indices 0, 7, 14, 21 → 4 items
    expect(result).toHaveLength(4);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    expect(result[1].timestamp).toBe(snapshots[7].timestamp);
  });

  test('period "ALL" (14d thinning) keeps every 14th snapshot starting from oldest', async () => {
    const snapshots = makeDailySnapshots(28);
    mockGetStakingSnapshotsFn.mockResolvedValue({
      results: snapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getStakingSnapshots(client, {
      chainId: 8453,
      period: "ALL",
    });

    // indices 0, 14 → 2 items
    expect(result).toHaveLength(2);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    expect(result[1].timestamp).toBe(snapshots[14].timestamp);
  });

  test("descending API response is sorted ascending before thinning", async () => {
    const base = 1700000000;
    const descendingSnapshots = [
      makeLunarStakingSnapshot(base + 2 * 86400),
      makeLunarStakingSnapshot(base + 86400),
      makeLunarStakingSnapshot(base),
    ];
    mockGetStakingSnapshotsFn.mockResolvedValue({
      results: descendingSnapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getStakingSnapshots(client, {
      chainId: 8453,
      period: "1Y",
    });

    expect(result[0].timestamp).toBe(base);
  });

  // --- Pagination ---

  test("fetches all pages when nextCursor is returned", async () => {
    const page1 = makeDailySnapshots(3, 1700000000);
    const page2 = makeDailySnapshots(3, 1700000000 + 3 * 86400);

    mockGetStakingSnapshotsFn
      .mockResolvedValueOnce({ results: page1, nextCursor: "cursor-abc" })
      .mockResolvedValueOnce({ results: page2, nextCursor: NO_MORE_PAGES });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getStakingSnapshots(client, {
      chainId: 8453,
      period: "3M",
    });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(6);
  });

  test("second page call includes cursor from first page", async () => {
    const page1 = makeDailySnapshots(2, 1700000000);

    mockGetStakingSnapshotsFn
      .mockResolvedValueOnce({ results: page1, nextCursor: "cursor-xyz" })
      .mockResolvedValueOnce({ results: [], nextCursor: NO_MORE_PAGES });

    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453 });

    expect(mockGetStakingSnapshotsFn).toHaveBeenNthCalledWith(
      2,
      8453,
      expect.objectContaining({ cursor: "cursor-xyz" }),
    );
  });

  // --- endTime / startTime forwarding ---

  test("custom endTime is forwarded to Lunar API", async () => {
    const customEnd = 1700100000;
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, { chainId: 8453, endTime: customEnd });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ endTime: customEnd }),
    );
  });

  test("custom startTime and endTime are forwarded to Lunar API", async () => {
    const customStart = 1699000000;
    const customEnd = 1700000000;
    const client = makeClient(MOCK_LUNAR_URL);
    await getStakingSnapshots(client, {
      chainId: 8453,
      startTime: customStart,
      endTime: customEnd,
    });

    expect(mockGetStakingSnapshotsFn).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ startTime: customStart, endTime: customEnd }),
    );
  });
});

describe("Ponder path (indexerUrl, no lunarIndexerUrl)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ponderItems = [
    {
      chainId: 1285,
      totalStaked: 1000,
      totalStakedUSD: 500,
      timestamp: 1700000000,
    },
    {
      chainId: 1285,
      totalStaked: 2000,
      totalStakedUSD: 1000,
      timestamp: 1700086400,
    },
  ];

  test("calls axios.post with indexerUrl when no lunarIndexerUrl", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: { data: { stakingDailySnapshots: { items: ponderItems } } },
    });

    const client = makeMoonriverClientWithPonder();
    await getStakingSnapshots(client, { chainId: 1285 });

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.objectContaining({
        query: expect.stringContaining("chainId: 1285"),
      }),
    );
    expect(createLunarIndexerClient).not.toHaveBeenCalled();
  });

  test("returns mapped snapshot data from Ponder", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: { data: { stakingDailySnapshots: { items: ponderItems } } },
    });

    const client = makeMoonriverClientWithPonder();
    const result = await getStakingSnapshots(client, {
      chainId: 1285,
      period: "ALL",
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.totalStaked).toBe(1000);
    expect(result[1]?.totalStaked).toBe(2000);
  });

  test("returns [] when both lunarIndexerUrl and indexerUrl are absent", async () => {
    const client = makeMoonriverClient();
    const result = await getStakingSnapshots(client, { chainId: 1285 });

    expect(result).toEqual([]);
    expect(vi.mocked(axios.post)).not.toHaveBeenCalled();
  });
});
