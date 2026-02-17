import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import {
  fetchAccountMarketPortfolioFromIndexer,
  fetchMarketFromIndexer,
  fetchMarketSnapshotsFromIndexer,
  fetchMarketsFromIndexer,
  transformMarketFromIndexer,
  transformMarketsFromIndexer,
} from "./lunarIndexerTransform.js";

describe("Lunar Indexer Market Transformation Tests", () => {
  // Base chain market for testing
  const testChainId = 8453; // Base
  const testMarketId =
    "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba"; // wstETH/WETH market
  const testAccountAddress = "0x45db397E443721D77480ADbFae4753D003D28F1D";

  // Get Base environment for testing
  const baseEnvironment = testClient.environments.base;

  test("Environment has lunar indexer URL configured", () => {
    expect(baseEnvironment).toBeDefined();
    expect(baseEnvironment?.custom?.morpho?.lunarIndexerUrl).toBeDefined();
  });

  test("Fetch markets from Lunar Indexer", async () => {
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketsFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const market = await fetchMarketFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const indexerMarket = await fetchMarketFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
      testChainId,
      testMarketId,
    );

    const sdkMarket = transformMarketFromIndexer(
      indexerMarket,
      baseEnvironment,
    );

    // Verify SDK market structure
    expect(sdkMarket).toBeDefined();
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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketsFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
      testChainId,
    );

    const sdkMarkets = transformMarketsFromIndexer(
      response.results,
      baseEnvironment,
    );

    expect(sdkMarkets).toBeDefined();
    expect(Array.isArray(sdkMarkets)).toBe(true);
    expect(sdkMarkets.length).toBe(response.results.length);

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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const response = await fetchMarketSnapshotsFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
      console.log("Skipping test: Lunar indexer URL not configured");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 86400 * 30;

    const response = await fetchAccountMarketPortfolioFromIndexer(
      baseEnvironment.custom.morpho.lunarIndexerUrl,
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
    if (!baseEnvironment?.custom?.morpho?.lunarIndexerUrl) {
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
