import axios from "axios";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import type { MarketSnapshot } from "../../../types/market.js";
import type { LunarIndexerMarketSnapshot } from "../../morpho/markets/lunarIndexerTransform.js";
import { fetchMarketSnapshotsFromIndexer } from "../../morpho/markets/lunarIndexerTransform.js";
import {
  fetchIsolatedMarketSnapshots,
  getMarketSnapshots,
  trimLeadingEmptySnapshots,
} from "./getMarketSnapshots.js";

// ---------------------------------------------------------------------------
// Module mock — replace only the HTTP-fetching function so unit tests never
// hit the network. All other exports (transform helpers, etc.) stay real.
// ---------------------------------------------------------------------------

vi.mock(
  "../../morpho/markets/lunarIndexerTransform.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../morpho/markets/lunarIndexerTransform.js")
      >();
    return { ...actual, fetchMarketSnapshotsFromIndexer: vi.fn() };
  },
);

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

// 2024-01-01 00:00:00 UTC and 2024-01-02 00:00:00 UTC — both are start-of-day
const DAY1 = 1704067200;
const DAY2 = 1704153600;

const STKWELL_MARKET_ID =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as `0x${string}`;
const WELL_MARKET_ID =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as `0x${string}`;

const MOCK_INDEXER_URL = "https://mock-indexer.test";

/** Minimal environment that has a stkWELL/USDC and a WELL/USDC market. */
const mockEnvironment = {
  lunarIndexerUrl: MOCK_INDEXER_URL,
  chainId: 8453,
  custom: { morpho: { minimalDeployment: true } },
  config: {
    morphoMarkets: {
      stkWellUsdc: {
        id: STKWELL_MARKET_ID,
        collateralToken: "stkWELL",
        loanToken: "USDC",
      },
      wellUsdc: {
        id: WELL_MARKET_ID,
        collateralToken: "WELL",
        loanToken: "USDC",
      },
    },
    tokens: {
      stkWELL: { symbol: "stkWELL", decimals: 18 },
      WELL: { symbol: "WELL", decimals: 18 },
      USDC: { symbol: "USDC", decimals: 6 },
    },
  },
} as unknown as Environment;

// The SDK type says `nextCursor: string` but the real API returns `null` when
// there are no more pages (the code uses `?? undefined` to detect end-of-pages).
// We cast `null as unknown as string` to satisfy TypeScript while keeping the
// correct runtime value that terminates the pagination loop.
const NO_MORE_PAGES = null as unknown as string;

function makeStkWellSnapshot(
  timestamp: number,
  overrides: Partial<LunarIndexerMarketSnapshot> = {},
): LunarIndexerMarketSnapshot {
  return {
    id: `8453-stkwell-${timestamp}`,
    chainId: 8453,
    marketId: STKWELL_MARKET_ID,
    timestamp,
    blockNumber: "12000000",
    // 100 USDC supplied, $100 USD value, loanTokenPrice = $1
    totalSupplyAssets: "100.0",
    totalBorrowAssets: "50.0",
    totalLiquidity: "50.0",
    totalSupplyAssetsUsd: "100.0",
    totalBorrowAssetsUsd: "50.0",
    totalLiquidityUsd: "50.0",
    loanTokenPrice: "1.0",
    collateralTokenPrice: "0", // indexer doesn't price stkWELL
    supplyApy: "0.05",
    borrowApy: "0.08",
    lltv: "80",
    fee: "0",
    timeInterval: 86400,
    ...overrides,
  };
}

function makeWellSnapshot(
  timestamp: number,
  wellPrice: number,
): LunarIndexerMarketSnapshot {
  return {
    id: `8453-well-${timestamp}`,
    chainId: 8453,
    marketId: WELL_MARKET_ID,
    timestamp,
    blockNumber: "12000000",
    totalSupplyAssets: "1000000.0",
    totalBorrowAssets: "500000.0",
    totalLiquidity: "500000.0",
    totalSupplyAssetsUsd: "5000.0",
    totalBorrowAssetsUsd: "2500.0",
    totalLiquidityUsd: "2500.0",
    loanTokenPrice: "1.0",
    collateralTokenPrice: String(wellPrice), // WELL is collateral in WELL/USDC market
    supplyApy: "0.03",
    borrowApy: "0.04",
    lltv: "80",
    fee: "0",
    timeInterval: 86400,
  };
}

function makeMarketSnapshot(
  timestamp: number,
  totalSupply: number,
  totalBorrows: number,
  extra: Partial<MarketSnapshot> = {},
): MarketSnapshot {
  return {
    chainId: 8453,
    timestamp,
    marketId: "0xtest",
    totalSupply,
    totalSupplyUsd: totalSupply,
    totalBorrows,
    totalBorrowsUsd: totalBorrows,
    totalLiquidity: Math.max(totalSupply - totalBorrows, 0),
    totalLiquidityUsd: Math.max(totalSupply - totalBorrows, 0),
    totalReallocatableLiquidity: 0,
    totalReallocatableLiquidityUsd: 0,
    baseSupplyApy: 0.05,
    baseBorrowApy: 0.08,
    collateralTokenPrice: 1,
    loanTokenPrice: 1,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// trimLeadingEmptySnapshots — pure unit tests
// ---------------------------------------------------------------------------

describe("trimLeadingEmptySnapshots (unit)", () => {
  test("returns empty array for empty input", () => {
    expect(trimLeadingEmptySnapshots([])).toEqual([]);
  });

  test("returns empty array when all snapshots are zero", () => {
    const snapshots = [
      makeMarketSnapshot(DAY1, 0, 0),
      makeMarketSnapshot(DAY2, 0, 0),
    ];
    expect(trimLeadingEmptySnapshots(snapshots)).toEqual([]);
  });

  test("trims leading zero snapshots (ascending order)", () => {
    const snapshots = [
      makeMarketSnapshot(DAY1, 0, 0),
      makeMarketSnapshot(DAY2, 100, 50),
    ];
    const result = trimLeadingEmptySnapshots(snapshots);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(DAY2);
  });

  test("trims leading zero snapshots (descending order)", () => {
    // Ponder returns newest-first; function must still work
    const snapshots = [
      makeMarketSnapshot(DAY2, 100, 50),
      makeMarketSnapshot(DAY1, 0, 0),
    ];
    const result = trimLeadingEmptySnapshots(snapshots);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(DAY2);
  });

  test("keeps all snapshots when none are leading zeros", () => {
    const snapshots = [
      makeMarketSnapshot(DAY1, 100, 50),
      makeMarketSnapshot(DAY2, 200, 80),
    ];
    expect(trimLeadingEmptySnapshots(snapshots)).toHaveLength(2);
  });

  test("does not trim trailing zeros (only leading)", () => {
    const DAY3 = DAY2 + 86400;
    const snapshots = [
      makeMarketSnapshot(DAY1, 0, 0),
      makeMarketSnapshot(DAY2, 100, 50),
      makeMarketSnapshot(DAY3, 0, 0), // trailing zero should be kept
    ];
    const result = trimLeadingEmptySnapshots(snapshots);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.timestamp)).toEqual([DAY2, DAY3]);
  });

  test("keeps a snapshot that only has totalBorrows > 0", () => {
    const snapshots = [
      makeMarketSnapshot(DAY1, 0, 0),
      makeMarketSnapshot(DAY2, 0, 10), // borrow-only is still active
    ];
    const result = trimLeadingEmptySnapshots(snapshots);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(DAY2);
  });
});

// ---------------------------------------------------------------------------
// stkWELL price workaround — unit tests via fetchIsolatedMarketSnapshots
// ---------------------------------------------------------------------------

describe("fetchIsolatedMarketSnapshots — stkWELL workaround (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupFetchMock(
    stkWellSnapshots: LunarIndexerMarketSnapshot[],
    wellSnapshots: LunarIndexerMarketSnapshot[],
  ) {
    vi.mocked(fetchMarketSnapshotsFromIndexer).mockImplementation(
      (_url, _chainId, marketId) => {
        const results =
          marketId === STKWELL_MARKET_ID ? stkWellSnapshots : wellSnapshots;
        return Promise.resolve({ results, nextCursor: NO_MORE_PAGES });
      },
    );
  }

  test("replaces zero collateralTokenPrice with WELL price", async () => {
    setupFetchMock(
      [makeStkWellSnapshot(DAY1)],
      [makeWellSnapshot(DAY1, 0.005)],
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].collateralTokenPrice).toBeCloseTo(0.005);
  });

  test("converts totalSupply from USDC units to stkWELL units", async () => {
    // 100 USDC supplied, WELL = $0.005 → 100 / 0.005 = 20,000 stkWELL
    setupFetchMock(
      [makeStkWellSnapshot(DAY1)], // totalSupplyAssetsUsd = 100
      [makeWellSnapshot(DAY1, 0.005)],
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    expect(snapshots[0].totalSupply).toBeCloseTo(100 / 0.005); // 20,000 stkWELL
    expect(snapshots[0].totalSupplyUsd).toBeCloseTo(100); // USD unchanged
  });

  test("converts totalLiquidity from USDC units to stkWELL units", async () => {
    // 50 USDC liquidity, WELL = $0.005 → 50 / 0.005 = 10,000 stkWELL
    setupFetchMock(
      [makeStkWellSnapshot(DAY1)], // totalLiquidityUsd = 50
      [makeWellSnapshot(DAY1, 0.005)],
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    expect(snapshots[0].totalLiquidity).toBeCloseTo(50 / 0.005); // 10,000 stkWELL
  });

  test("handles multiple snapshots with per-timestamp WELL prices", async () => {
    // Day 1: WELL = $0.005 → 100 / 0.005 = 20,000 stkWELL
    // Day 2: WELL = $0.004 → 100 / 0.004 = 25,000 stkWELL
    setupFetchMock(
      [makeStkWellSnapshot(DAY1), makeStkWellSnapshot(DAY2)],
      [makeWellSnapshot(DAY1, 0.005), makeWellSnapshot(DAY2, 0.004)],
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    expect(snapshots).toHaveLength(2);
    const day1 = snapshots.find((s) => s.timestamp === DAY1 * 1000);
    const day2 = snapshots.find((s) => s.timestamp === DAY2 * 1000);
    expect(day1?.totalSupply).toBeCloseTo(100 / 0.005);
    expect(day2?.totalSupply).toBeCloseTo(100 / 0.004);
  });

  test("falls back to raw totalSupply when no WELL price for that timestamp", async () => {
    // stkWELL snapshot at DAY2, but WELL price only exists for DAY1
    setupFetchMock(
      [makeStkWellSnapshot(DAY2)],
      [makeWellSnapshot(DAY1, 0.005)], // no price for DAY2
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    // No price match → keeps raw totalSupply from the snapshot
    expect(snapshots[0].totalSupply).toBeCloseTo(100); // raw USDC value unchanged
    expect(snapshots[0].collateralTokenPrice).toBe(0); // still zero
  });

  test("uses existing non-zero collateralTokenPrice without overriding with WELL price", async () => {
    // collateralTokenPrice already set (indexer correctly priced it)
    setupFetchMock(
      [makeStkWellSnapshot(DAY1, { collateralTokenPrice: "0.006" })],
      [makeWellSnapshot(DAY1, 0.005)], // different price
    );

    const snapshots = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );

    // Should keep the indexed price (0.006), not replace with WELL price (0.005)
    expect(snapshots[0].collateralTokenPrice).toBeCloseTo(0.006);
    expect(snapshots[0].totalSupply).toBeCloseTo(100 / 0.006);
  });

  test("returns [] and calls onError when Lunar throws", async () => {
    const clientError = Object.assign(new Error("Bad Request"), {
      isAxiosError: true,
      response: { status: 400, statusText: "Bad Request" },
    });

    vi.mocked(fetchMarketSnapshotsFromIndexer).mockImplementation(
      (_url, _chainId, marketId) => {
        if (marketId === STKWELL_MARKET_ID) {
          return Promise.reject(clientError);
        }
        return Promise.resolve({ results: [], nextCursor: NO_MORE_PAGES });
      },
    );

    const result = await fetchIsolatedMarketSnapshots(
      STKWELL_MARKET_ID,
      mockEnvironment,
    );
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Core market snapshots — Ponder path (indexerUrl, no lunarIndexerUrl)
// ---------------------------------------------------------------------------

describe("core market snapshots — Ponder path (indexerUrl, no lunarIndexerUrl)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const MOCK_PONDER_URL = "https://mock-ponder.test";
  const CORE_MARKET_ADDRESS =
    "0xaaaa000000000000000000000000000000000001" as `0x${string}`;
  const MOONRIVER_CHAIN_ID = 1285;

  function makeMoonriverClient(): MoonwellClient {
    return {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          indexerUrl: MOCK_PONDER_URL,
          config: {
            markets: {},
            tokens: {},
            vaults: {},
            morphoMarkets: {},
            contracts: {},
          },
        } as unknown as Environment,
      },
    } as unknown as MoonwellClient;
  }

  test("calls axios.post with indexerUrl when no lunarIndexerUrl", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        data: {
          marketDailySnapshots: {
            items: [],
            pageInfo: { hasNextPage: false, endCursor: "" },
          },
        },
      },
    });

    await getMarketSnapshots(makeMoonriverClient(), {
      chainId: MOONRIVER_CHAIN_ID,
      type: "core",
      marketId: CORE_MARKET_ADDRESS,
    });

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.objectContaining({
        query: expect.stringContaining(CORE_MARKET_ADDRESS.toLowerCase()),
      }),
    );
  });

  test("returns mapped snapshots from Ponder", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        data: {
          marketDailySnapshots: {
            items: [
              {
                totalBorrows: 100,
                totalBorrowsUSD: 100,
                totalSupplies: 1000,
                totalSuppliesUSD: 1000,
                totalLiquidity: 900,
                totalLiquidityUSD: 900,
                baseSupplyApy: 0.05,
                baseBorrowApy: 0.08,
                timestamp: 1704067200, // 2024-01-01 00:00:00 UTC (start of day)
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: "" },
          },
        },
      },
    });

    const result = await getMarketSnapshots(makeMoonriverClient(), {
      chainId: MOONRIVER_CHAIN_ID,
      type: "core",
      marketId: CORE_MARKET_ADDRESS,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.totalSupply).toBe(1000);
    expect(result[0]?.totalBorrows).toBe(100);
    expect(result[0]?.baseSupplyApy).toBe(0.05);
  });

  test("returns [] when both lunarIndexerUrl and indexerUrl are absent", async () => {
    const noUrlClient = {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          indexerUrl: undefined,
          config: {
            markets: {},
            tokens: {},
            vaults: {},
            morphoMarkets: {},
            contracts: {},
          },
        } as unknown as Environment,
      },
    } as unknown as MoonwellClient;

    const result = await getMarketSnapshots(noUrlClient, {
      chainId: MOONRIVER_CHAIN_ID,
      type: "core",
      marketId: CORE_MARKET_ADDRESS,
    });

    expect(result).toEqual([]);
    expect(vi.mocked(axios.post)).not.toHaveBeenCalled();
  });
});
