/**
 * Unit tests for getMorphoVaultStakingSnapshots.
 *
 * These tests use module mocks so they never hit real network endpoints.
 * They verify:
 *  - Correct API granularity is requested for each period
 *  - Client-side applyGranularity thins the results correctly
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import type { LunarVaultStakingSnapshot } from "../../lunar-indexer-client.js";
import { createLunarIndexerClient } from "../../lunar-indexer-client.js";
import { getMorphoVaultStakingSnapshots } from "./getMorphoVaultStakingSnapshots.js";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("../../lunar-indexer-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lunar-indexer-client.js")>();
  return { ...actual, createLunarIndexerClient: vi.fn() };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const MOCK_LUNAR_URL = "https://mock-lunar.test";
const MOCK_VAULT_ADDRESS = "0xaabbccdd00112233445566778899aabbccddeeff";

const NO_MORE_PAGES = null as unknown as string;

function makeLunarVaultSnapshot(
  timestamp: number,
  overrides: Partial<LunarVaultStakingSnapshot> = {},
): LunarVaultStakingSnapshot {
  return {
    id: `8453-vault-${timestamp}`,
    chainId: 8453,
    vaultAddress: MOCK_VAULT_ADDRESS,
    timestamp,
    blockNumber: "12000000",
    totalStaked: "2000000",
    totalStakedUSD: "1000000",
    underlyingPrice: "1.0",
    timeInterval: 86400,
    ...overrides,
  };
}

function makeDailyVaultSnapshots(
  count: number,
  baseTimestamp = 1700000000,
): LunarVaultStakingSnapshot[] {
  return Array.from({ length: count }, (_, i) =>
    makeLunarVaultSnapshot(baseTimestamp + i * 86400),
  );
}

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

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const mockGetVaultStakingSnapshots = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(createLunarIndexerClient).mockReturnValue({
    getVaultStakingSnapshots: mockGetVaultStakingSnapshots,
  } as never);

  mockGetVaultStakingSnapshots.mockResolvedValue({
    results: [],
    nextCursor: NO_MORE_PAGES,
  });
});

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

describe("per-environment routing", () => {
  test("calls Lunar Indexer when lunarIndexerUrl is configured", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(createLunarIndexerClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: MOCK_LUNAR_URL }),
    );
    expect(mockGetVaultStakingSnapshots).toHaveBeenCalled();
  });

  test("returns [] when lunarIndexerUrl is NOT configured", async () => {
    const client = makeClient(undefined);
    const result = await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(createLunarIndexerClient).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("vaultAddress is lowercased when passed to Lunar API", async () => {
    const upperVault = MOCK_VAULT_ADDRESS.toUpperCase() as `0x${string}`;
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: upperVault,
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({
        vaultAddress: MOCK_VAULT_ADDRESS.toLowerCase(),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Granularity per period
// ---------------------------------------------------------------------------

describe("granularity passed to Lunar API per period", () => {
  test('period "1M" → API receives granularity "6h"', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "1M",
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "6h" }),
    );
  });

  test('period "3M" → API receives granularity "1d"', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "3M",
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });

  test('period "1Y" → API receives granularity "1d" (7d thinning is client-side)', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "1Y",
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });

  test('period "ALL" → API receives granularity "1d" (14d thinning is client-side)', async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "ALL",
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ granularity: "1d" }),
    );
  });
});

// ---------------------------------------------------------------------------
// Client-side granularity thinning (applyGranularity)
// ---------------------------------------------------------------------------

describe("client-side granularity thinning", () => {
  test('period "1Y" (7d thinning) keeps every 7th snapshot', async () => {
    const snapshots = makeDailyVaultSnapshots(28);
    mockGetVaultStakingSnapshots.mockResolvedValue({
      results: snapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "1Y",
    });

    // indices 0, 7, 14, 21 → 4 items
    expect(result).toHaveLength(4);
    // Timestamps are in ms (transformer multiplies by 1000)
    expect(result[0].timestamp).toBe(snapshots[0].timestamp * 1000);
    expect(result[1].timestamp).toBe(snapshots[7].timestamp * 1000);
  });

  test('period "ALL" (14d thinning) keeps every 14th snapshot', async () => {
    const snapshots = makeDailyVaultSnapshots(28);
    mockGetVaultStakingSnapshots.mockResolvedValue({
      results: snapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "ALL",
    });

    // indices 0, 14 → 2 items
    expect(result).toHaveLength(2);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp * 1000);
    expect(result[1].timestamp).toBe(snapshots[14].timestamp * 1000);
  });

  test("descending API response is sorted ascending before thinning", async () => {
    const base = 1700000000;
    const descSnapshots = [
      makeLunarVaultSnapshot(base + 2 * 86400),
      makeLunarVaultSnapshot(base + 86400),
      makeLunarVaultSnapshot(base),
    ];
    mockGetVaultStakingSnapshots.mockResolvedValue({
      results: descSnapshots,
      nextCursor: NO_MORE_PAGES,
    });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "1Y",
    });

    // Oldest should be first
    expect(result[0].timestamp).toBe(base * 1000);
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

describe("pagination", () => {
  test("fetches all pages when nextCursor is returned", async () => {
    const page1 = makeDailyVaultSnapshots(3, 1700000000);
    const page2 = makeDailyVaultSnapshots(3, 1700000000 + 3 * 86400);

    mockGetVaultStakingSnapshots
      .mockResolvedValueOnce({ results: page1, nextCursor: "cursor-abc" })
      .mockResolvedValueOnce({ results: page2, nextCursor: NO_MORE_PAGES });

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      period: "3M",
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// endTime forwarding
// ---------------------------------------------------------------------------

describe("endTime forwarding", () => {
  test("custom endTime is forwarded to Lunar API", async () => {
    const customEnd = 1700100000;
    const client = makeClient(MOCK_LUNAR_URL);

    await getMorphoVaultStakingSnapshots(client, {
      chainId: 8453,
      vaultAddress: MOCK_VAULT_ADDRESS,
      endTime: customEnd,
    });

    expect(mockGetVaultStakingSnapshots).toHaveBeenCalledWith(
      8453,
      expect.objectContaining({ endTime: customEnd }),
    );
  });
});
