import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type {
  LunarIndexerMarket,
  LunarIndexerMarketSnapshot,
} from "./lunarIndexerTransform.js";
import {
  fetchAccountMarketPortfolioFromIndexer,
  fetchMarketFromIndexer,
  fetchMarketSnapshotsFromIndexer,
  fetchMarketsFromIndexer,
  transformIsolatedMarketSnapshotFromIndexer,
  transformMarketFromIndexer,
  transformMarketsFromIndexer,
} from "./lunarIndexerTransform.js";

// ---------------------------------------------------------------------------
// Unit tests — no network required, use fixed mock data
// ---------------------------------------------------------------------------

describe("transformIsolatedMarketSnapshotFromIndexer (unit)", () => {
  const mockSnapshot: LunarIndexerMarketSnapshot = {
    id: "8453-snapshot-1",
    chainId: 8453,
    marketId:
      "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba",
    timestamp: 1700000000,
    blockNumber: "12345678",
    totalSupplyAssets: "4237.378517",
    totalBorrowAssets: "3328.849088",
    totalLiquidity: "908.529429",
    totalSupplyAssetsUsd: "8820396.72",
    totalBorrowAssetsUsd: "6929229.83",
    totalLiquidityUsd: "1891166.89",
    loanTokenPrice: "2081.56",
    collateralTokenPrice: "2445.00",
    supplyApy: "0.02",
    borrowApy: "0.025",
    lltv: "94.5",
    fee: "0.1",
    timeInterval: 86400,
  };

  test("maps fields correctly without normalization", () => {
    const result = transformIsolatedMarketSnapshotFromIndexer(mockSnapshot);

    expect(result.chainId).toBe(8453);
    expect(result.marketId).toBe(mockSnapshot.marketId.toLowerCase());
    expect(result.timestamp).toBe(1700000000 * 1000);
    expect(result.totalSupply).toBeCloseTo(4237.378517, 4);
    expect(result.totalLiquidity).toBeCloseTo(908.529429, 4);
    expect(result.totalBorrows).toBeCloseTo(3328.849088, 4);
    expect(result.totalSupplyUsd).toBeCloseTo(8820396.72, 1);
    expect(result.loanTokenPrice).toBeCloseTo(2081.56, 2);
    expect(result.collateralTokenPrice).toBeCloseTo(2445.0, 2);
    expect(result.baseSupplyApy).toBeCloseTo(0.02, 4);
    expect(result.baseBorrowApy).toBeCloseTo(0.025, 4);
  });

  test("normalizes supply and liquidity to collateral units when normalizeToCollateral is true", () => {
    // USDC/ETH market: loan = WETH, collateral = USDC. The indexer returns
    // totalSupplyAssets in WETH units; we need USDC-equivalent units for the chart.
    const result = transformIsolatedMarketSnapshotFromIndexer(mockSnapshot, {
      normalizeToCollateral: true,
    });

    const expectedSupply = 8820396.72 / 2445.0;
    const expectedLiquidity = 1891166.89 / 2445.0;
    expect(result.totalSupply).toBeCloseTo(expectedSupply, 2);
    expect(result.totalLiquidity).toBeCloseTo(expectedLiquidity, 2);
    // USD values and prices should be unchanged
    expect(result.totalSupplyUsd).toBeCloseTo(8820396.72, 1);
    expect(result.loanTokenPrice).toBeCloseTo(2081.56, 2);
  });

  test("falls back to raw values when collateralTokenPrice is zero", () => {
    const zeroCollateralSnapshot = {
      ...mockSnapshot,
      collateralTokenPrice: "0",
    };
    const result = transformIsolatedMarketSnapshotFromIndexer(
      zeroCollateralSnapshot,
      { normalizeToCollateral: true },
    );
    // normalizeToCollateral requires collateralTokenPrice > 0 to avoid division by zero
    expect(result.totalSupply).toBeCloseTo(4237.378517, 4);
  });
});

describe("transformMarketFromIndexer (unit)", () => {
  const baseEnvironment = testClient.environments.base;

  // wstETH/WETH market on Base — well-established market used as a stable test fixture
  const wstEthWethMarketId =
    "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba";

  const mockMarket: LunarIndexerMarket = {
    marketId: wstEthWethMarketId,
    chainId: 8453,
    totalSupplyAssets: "4237.378517",
    totalBorrowAssets: "3328.849088",
    totalLiquidity: "908.529429",
    totalSupplyAssetsUsd: "8820396.72",
    totalBorrowAssetsUsd: "6929229.83",
    totalLiquidityUsd: "1891166.89",
    loanTokenPrice: "2081.56",
    collateralTokenPrice: "2445.00",
    supplyApy: "0.02",
    borrowApy: "0.025",
    lltv: "94.5",
    fee: "0.1",
    oracle: "0x0000000000000000000000000000000000000001",
    irm: "0x0000000000000000000000000000000000000002",
    loanToken: {
      address: "0x4200000000000000000000000000000000000006",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    },
    collateralToken: {
      address: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
      name: "Wrapped liquid staked Ether 2.0",
      symbol: "wstETH",
      decimals: 18,
    },
  };

  test("returns null for a market ID not present in the environment config", () => {
    const unknownMarket = {
      ...mockMarket,
      marketId:
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    };
    const result = transformMarketFromIndexer(unknownMarket, baseEnvironment);
    expect(result).toBeNull();
  });

  test("maps all core fields correctly", () => {
    const result = transformMarketFromIndexer(mockMarket, baseEnvironment);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.chainId).toBe(8453);
    expect(result.marketId.toLowerCase()).toBe(
      wstEthWethMarketId.toLowerCase(),
    );
    expect(result.marketKey).toBeDefined();
    expect(result.loanTokenPrice).toBeCloseTo(2081.56, 2);
    expect(result.collateralTokenPrice).toBeCloseTo(2445.0, 2);
    expect(result.baseSupplyApy).toBeCloseTo(0.02, 4);
    expect(result.baseBorrowApy).toBeCloseTo(0.025, 4);
    expect(result.loanToValue).toBeCloseTo(0.945, 3);
    expect(result.totalSupplyUsd).toBeCloseTo(8820396.72, 1);
    expect(result.totalBorrowsUsd).toBeCloseTo(6929229.83, 1);
    expect(result.rewards).toEqual([]);
    expect(result.collateralAssets).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Integration tests — require live lunar-indexer (skipped when URL is absent)
// ---------------------------------------------------------------------------

describe("Lunar Indexer Market Transformation Tests", () => {
  // Base chain market for testing
  const testChainId = 8453; // Base
  // wstETH/WETH market on Base — well-established, used as a stable integration fixture
  const testMarketId =
    "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba"; // wstETH/WETH market
  // Known active account on Base with Morpho positions, used to verify portfolio endpoint
  const testAccountAddress = "0x45db397E443721D77480ADbFae4753D003D28F1D";

  // Get Base environment for testing
  const baseEnvironment = testClient.environments.base;

  test("Environment has lunar indexer URL configured", () => {
    expect(baseEnvironment).toBeDefined();
    expect(baseEnvironment?.lunarIndexerUrl).toBeDefined();
  });

  test("Fetch markets from Lunar Indexer", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketsFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testChainId,
    );

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    // Check structure of first market
    const firstMarket = response.results[0];
    expect(firstMarket.marketId).toBeDefined();
    expect(firstMarket.chainId).toBe(testChainId);
    expect(firstMarket.totalSupplyAssets).toBeDefined();
    expect(firstMarket.totalBorrowAssets).toBeDefined();
    expect(firstMarket.loanToken).toBeDefined();
    expect(firstMarket.collateralToken).toBeDefined();
    expect(firstMarket.supplyApy).toBeDefined();
    expect(firstMarket.borrowApy).toBeDefined();

    console.log(
      `Fetched ${response.results.length} markets from lunar indexer`,
    );
  }, 30000);

  test("Fetch single market from Lunar Indexer", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const market = await fetchMarketFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testChainId,
      testMarketId,
    );

    expect(market).toBeDefined();
    expect(market.marketId.toLowerCase()).toBe(testMarketId.toLowerCase());
    expect(market.chainId).toBe(testChainId);
    expect(market.loanToken.symbol).toBeDefined();
    expect(market.collateralToken.symbol).toBeDefined();

    console.log(
      `Fetched market: ${market.collateralToken.symbol}/${market.loanToken.symbol}`,
    );
  }, 30000);

  test("Transform market from Lunar Indexer to SDK type", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const indexerMarket = await fetchMarketFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testChainId,
      testMarketId,
    );

    const sdkMarket = transformMarketFromIndexer(
      indexerMarket,
      baseEnvironment,
    );

    // Verify SDK market structure
    expect(sdkMarket).not.toBeNull();
    if (!sdkMarket) return;
    expect(sdkMarket.chainId).toBe(testChainId);
    expect(sdkMarket.marketId.toLowerCase()).toBe(testMarketId.toLowerCase());
    expect(sdkMarket.marketKey).toBeDefined();

    // Verify token configs
    expect(sdkMarket.loanToken).toBeDefined();
    expect(sdkMarket.loanToken.address).toBeDefined();
    expect(sdkMarket.loanToken.symbol).toBeDefined();
    expect(sdkMarket.loanToken.decimals).toBeGreaterThan(0);

    expect(sdkMarket.collateralToken).toBeDefined();
    expect(sdkMarket.collateralToken.address).toBeDefined();
    expect(sdkMarket.collateralToken.symbol).toBeDefined();
    expect(sdkMarket.collateralToken.decimals).toBeGreaterThan(0);

    // Verify Amount objects
    expect(sdkMarket.totalSupply).toBeDefined();
    expect(sdkMarket.totalSupply.value).toBeGreaterThan(0);
    expect(sdkMarket.totalBorrows).toBeDefined();
    expect(sdkMarket.availableLiquidity).toBeDefined();

    // Verify APYs
    expect(typeof sdkMarket.baseSupplyApy).toBe("number");
    expect(typeof sdkMarket.baseBorrowApy).toBe("number");

    // Verify prices
    expect(sdkMarket.loanTokenPrice).toBeGreaterThan(0);
    expect(sdkMarket.collateralTokenPrice).toBeGreaterThan(0);

    // Verify market params
    expect(sdkMarket.marketParams).toBeDefined();
    expect(sdkMarket.marketParams.loanToken).toBeDefined();
    expect(sdkMarket.marketParams.collateralToken).toBeDefined();
    expect(sdkMarket.marketParams.oracle).toBeDefined();
    expect(sdkMarket.marketParams.irm).toBeDefined();
    expect(sdkMarket.marketParams.lltv).toBeGreaterThan(0n);

    console.log(
      `Transformed market: ${sdkMarket.marketKey} (${sdkMarket.collateralToken.symbol}/${sdkMarket.loanToken.symbol})`,
    );
    console.log(`Total Supply: ${sdkMarket.totalSupply.value}`);
    console.log(`Total Borrows: ${sdkMarket.totalBorrows.value}`);
    console.log(`Supply APY: ${sdkMarket.baseSupplyApy}%`);
    console.log(`Borrow APY: ${sdkMarket.baseBorrowApy}%`);
  }, 30000);

  test("Transform multiple markets from Lunar Indexer", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketsFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testChainId,
    );

    const sdkMarkets = transformMarketsFromIndexer(
      response.results,
      baseEnvironment,
    );

    expect(sdkMarkets).toBeDefined();
    expect(Array.isArray(sdkMarkets)).toBe(true);
    // Markets not present in the environment config are filtered out, so the
    // transformed count may be less than the raw indexer count.
    expect(sdkMarkets.length).toBeGreaterThan(0);
    expect(sdkMarkets.length).toBeLessThanOrEqual(response.results.length);

    // Verify each market has correct structure
    sdkMarkets.forEach((market) => {
      expect(market.chainId).toBe(testChainId);
      expect(market.marketId).toBeDefined();
      expect(market.marketKey).toBeDefined();
      expect(market.totalSupply.value).toBeGreaterThanOrEqual(0);
      expect(market.totalBorrows.value).toBeGreaterThanOrEqual(0);
    });

    console.log(`Transformed ${sdkMarkets.length} markets successfully`);
  }, 30000);

  test("Fetch market snapshots from Lunar Indexer", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketSnapshotsFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testChainId,
      testMarketId,
      {
        limit: 25,
      },
    );

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.length).toBeLessThanOrEqual(25);

    // Check structure of first snapshot
    const firstSnapshot = response.results[0];
    expect(firstSnapshot.timestamp).toBeDefined();
    expect(firstSnapshot.blockNumber).toBeDefined();
    expect(firstSnapshot.totalSupplyAssets).toBeDefined();
    expect(firstSnapshot.totalBorrowAssets).toBeDefined();
    expect(firstSnapshot.supplyApy).toBeDefined();
    expect(firstSnapshot.borrowApy).toBeDefined();

    console.log(`Fetched ${response.results.length} market snapshots`);
    console.log(
      `First snapshot timestamp: ${new Date(firstSnapshot.timestamp * 1000).toISOString()}`,
    );
  }, 30000);

  test("Fetch account market portfolio from Lunar Indexer", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 86400 * 30;

    const response = await fetchAccountMarketPortfolioFromIndexer(
      baseEnvironment.lunarIndexerUrl!,
      testAccountAddress,
      {
        chainId: testChainId,
        startTime: thirtyDaysAgo,
        endTime: now,
        granularity: "1d",
      },
    );

    expect(response).toBeDefined();
    expect(response.account.toLowerCase()).toBe(
      testAccountAddress.toLowerCase(),
    );
    expect(response.positions).toBeDefined();
    expect(Array.isArray(response.positions)).toBe(true);

    if (response.positions.length > 0) {
      const firstPosition = response.positions[0];
      expect(firstPosition.timestamp).toBeDefined();
      expect(firstPosition.markets).toBeDefined();
      expect(Array.isArray(firstPosition.markets)).toBe(true);

      if (firstPosition.markets.length > 0) {
        const firstMarket = firstPosition.markets[0];
        expect(firstMarket.chainId).toBeDefined();
        expect(firstMarket.marketId).toBeDefined();
        expect(firstMarket.supplyShares).toBeDefined();
        expect(firstMarket.borrowShares).toBeDefined();
        expect(firstMarket.collateral).toBeDefined();
      }
    }

    console.log(`Fetched ${response.positions.length} portfolio positions`);
  }, 30000);

  test("Compare indexer data with SDK getMorphoMarkets", async () => {
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    // Fetch markets using SDK (which should use lunar-indexer now)
    const sdkMarkets = await testClient.getMorphoMarkets({
      chainId: testChainId,
    });

    expect(sdkMarkets).toBeDefined();
    expect(sdkMarkets.length).toBeGreaterThan(0);

    // Find the test market
    const testMarket = sdkMarkets.find(
      (m) => m.marketId.toLowerCase() === testMarketId.toLowerCase(),
    );

    expect(testMarket).toBeDefined();
    expect(testMarket?.chainId).toBe(testChainId);
    expect(testMarket?.totalSupply.value).toBeGreaterThan(0);
    expect(testMarket?.totalBorrows.value).toBeGreaterThan(0);
    expect(testMarket?.baseSupplyApy).toBeGreaterThanOrEqual(0);
    expect(testMarket?.baseBorrowApy).toBeGreaterThan(0);

    console.log(`SDK returned ${sdkMarkets.length} markets from lunar-indexer`);
    console.log(
      `Test market: ${testMarket?.collateralToken.symbol}/${testMarket?.loanToken.symbol}`,
    );
  }, 30000);
});
