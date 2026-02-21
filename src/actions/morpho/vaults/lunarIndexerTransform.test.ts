import { describe, expect, test } from "vitest";
import { Amount } from "../../../common/amount.js";
import { createEnvironment as createBaseEnvironment } from "../../../environments/definitions/base/environment.js";
import {
  fetchTokenMap,
  fetchVaultFromIndexer,
  fetchVaultSnapshotsFromIndexer,
  fetchVaultsFromIndexer,
  transformVaultFromIndexer,
  transformVaultSnapshotsFromIndexer,
  transformVaultsFromIndexer,
} from "./lunarIndexerTransform.js";

describe("Lunar Indexer Transformation Tests", () => {
  const LUNAR_INDEXER_URL =
    "https://lunar-services-worker.moonwell.workers.dev/api/v1/morpho";
  const BASE_CHAIN_ID = 8453;

  // Test fetching tokens from Lunar Indexer
  test("Fetch tokens from Lunar Indexer", async () => {
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    expect(tokenMap).toBeDefined();
    expect(tokenMap.size).toBeGreaterThan(0);

    // Check that cbBTC is in the map
    const cbBTC = tokenMap.get(
      "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf".toLowerCase(),
    );
    expect(cbBTC).toBeDefined();
    expect(cbBTC?.symbol).toBe("cbBTC");
    expect(cbBTC?.decimals).toBe(8);

    // Check that USDC is in the map
    const usdc = tokenMap.get(
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913".toLowerCase(),
    );
    expect(usdc).toBeDefined();
    expect(usdc?.symbol).toBe("USDC");
    expect(usdc?.decimals).toBe(6);
  });

  // Test fetching vaults from Lunar Indexer
  test("Fetch vaults from Lunar Indexer", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    // Check structure of first vault
    const vault = response.results[0];
    expect(vault.chainId).toBe(BASE_CHAIN_ID);
    expect(vault.address).toBeDefined();
    expect(vault.name).toBeDefined();
    expect(vault.symbol).toBeDefined();
    expect(vault.decimals).toBeDefined();
    expect(vault.totalSupply).toBeDefined();
    expect(vault.totalAssets).toBeDefined();
    expect(vault.baseApy).toBeDefined();
    expect(vault.markets).toBeDefined();
    expect(Array.isArray(vault.markets)).toBe(true);
  });

  // Test fetching single vault from Lunar Indexer
  test("Fetch single vault from Lunar Indexer", async () => {
    // Moonwell Frontier cbBTC
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const vault = await fetchVaultFromIndexer(LUNAR_INDEXER_URL, vaultId);

    expect(vault).toBeDefined();
    expect(vault.chainId).toBe(BASE_CHAIN_ID);
    expect(vault.address).toBe("0x543257ef2161176d7c8cd90ba65c2d4caef5a796");
    expect(vault.symbol).toBe("mwcbBTC");
    expect(vault.underlyingToken).toBeDefined(); // Should be populated in single vault
    expect(vault.underlyingToken?.symbol).toBe("cbBTC");
    expect(vault.underlyingToken?.decimals).toBe(8);
    expect(vault.rewards).toBeDefined();
    expect(Array.isArray(vault.rewards)).toBe(true);
  });

  // Test transformation of single vault
  test("Transform single vault from Lunar Indexer", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    // Check basic properties
    expect(transformedVault.chainId).toBe(BASE_CHAIN_ID);
    expect(transformedVault.vaultKey).toBeDefined();
    expect(transformedVault.version).toBeGreaterThanOrEqual(1);
    expect(transformedVault.version).toBeLessThanOrEqual(2);
    expect(typeof transformedVault.deprecated).toBe("boolean");

    // Check tokens
    expect(transformedVault.vaultToken).toBeDefined();
    expect(transformedVault.vaultToken.address.toLowerCase()).toBe(
      indexerVault.address.toLowerCase(),
    );
    expect(transformedVault.vaultToken.symbol).toBe("mwcbBTC");
    expect(transformedVault.vaultToken.decimals).toBe(18);

    expect(transformedVault.underlyingToken).toBeDefined();
    expect(transformedVault.underlyingToken.symbol).toBe("cbBTC");
    expect(transformedVault.underlyingToken.decimals).toBe(8);

    // Check Amount objects
    expect(transformedVault.totalSupply).toBeInstanceOf(Amount);
    expect(transformedVault.totalSupply.value).toBeGreaterThan(0);
    expect(transformedVault.totalSupply.exponential).toBeGreaterThan(0n);
    expect(transformedVault.totalSupply.base).toBe(8); // cbBTC decimals

    expect(transformedVault.totalLiquidity).toBeInstanceOf(Amount);
    expect(transformedVault.vaultSupply).toBeInstanceOf(Amount);

    // Check numeric values
    expect(typeof transformedVault.totalSupplyUsd).toBe("number");
    expect(transformedVault.totalSupplyUsd).toBeGreaterThan(0);
    expect(typeof transformedVault.underlyingPrice).toBe("number");
    expect(transformedVault.underlyingPrice).toBeGreaterThan(0);
    expect(typeof transformedVault.baseApy).toBe("number");
    expect(transformedVault.baseApy).toBeGreaterThanOrEqual(0);
    expect(typeof transformedVault.totalApy).toBe("number");
    expect(typeof transformedVault.performanceFee).toBe("number");
    expect(transformedVault.performanceFee).toBeGreaterThanOrEqual(0);
    expect(transformedVault.performanceFee).toBeLessThanOrEqual(1); // Should be 0-1, not 0-100
    expect(typeof transformedVault.timelock).toBe("number");

    // Check arrays
    expect(Array.isArray(transformedVault.markets)).toBe(true);
    expect(Array.isArray(transformedVault.rewards)).toBe(true);
    expect(Array.isArray(transformedVault.stakingRewards)).toBe(true);
    expect(Array.isArray(transformedVault.curators)).toBe(true);

    // Check markets structure
    if (transformedVault.markets.length > 0) {
      const market = transformedVault.markets[0];
      expect(market.marketId).toBeDefined();
      expect(typeof market.allocation).toBe("number");
      expect(market.allocation).toBeGreaterThanOrEqual(0);
      expect(market.allocation).toBeLessThanOrEqual(1);
      expect(typeof market.marketApy).toBe("number");
      expect(market.marketCollateral).toBeDefined();
      expect(market.marketCollateral.address).toBeDefined();
      expect(market.marketCollateral.decimals).toBeGreaterThan(0);
      expect(market.marketLiquidity).toBeInstanceOf(Amount);
      expect(typeof market.marketLiquidityUsd).toBe("number");
      expect(market.totalSupplied).toBeInstanceOf(Amount);
      expect(typeof market.totalSuppliedUsd).toBe("number");
    }

    // Check rewards structure if present
    if (transformedVault.rewards.length > 0) {
      const reward = transformedVault.rewards[0];
      expect(reward.asset).toBeDefined();
      expect(reward.asset.address).toBeDefined();
      expect(reward.asset.symbol).toBeDefined();
      expect(typeof reward.supplyApr).toBe("number");
    }
  });

  // Test transformation of multiple vaults
  test("Transform multiple vaults from Lunar Indexer", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVaults = transformVaultsFromIndexer(
      response.results,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(transformedVaults).toBeDefined();
    expect(Array.isArray(transformedVaults)).toBe(true);
    expect(transformedVaults.length).toBe(response.results.length);
    expect(transformedVaults.length).toBeGreaterThan(0);

    // Check all vaults are properly transformed
    transformedVaults.forEach((vault) => {
      expect(vault.chainId).toBe(BASE_CHAIN_ID);
      expect(vault.vaultKey).toBeDefined();
      expect(vault.vaultToken).toBeDefined();
      expect(vault.underlyingToken).toBeDefined();
      expect(vault.totalSupply).toBeInstanceOf(Amount);
      expect(vault.totalLiquidity).toBeInstanceOf(Amount);
      expect(vault.vaultSupply).toBeInstanceOf(Amount);
      expect(typeof vault.baseApy).toBe("number");
      expect(Array.isArray(vault.markets)).toBe(true);
    });
  });

  // Test Amount conversions are correct
  test("Verify Amount conversions match indexer data", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    // Verify totalAssets conversion
    const expectedTotalAssets = Number.parseFloat(indexerVault.totalAssets);
    expect(transformedVault.totalSupply.value).toBeCloseTo(
      expectedTotalAssets,
      6,
    );

    // Verify totalLiquidity conversion
    const expectedTotalLiquidity = Number.parseFloat(
      indexerVault.totalLiquidity,
    );
    expect(transformedVault.totalLiquidity.value).toBeCloseTo(
      expectedTotalLiquidity,
      6,
    );

    // Verify vaultSupply is calculated correctly (totalAssets - totalLiquidity)
    const expectedVaultSupply = expectedTotalAssets - expectedTotalLiquidity;
    expect(transformedVault.vaultSupply.value).toBeCloseTo(
      expectedVaultSupply,
      6,
    );

    // Verify price conversion
    expect(transformedVault.underlyingPrice).toBeCloseTo(
      Number.parseFloat(indexerVault.underlyingPrice),
      2,
    );

    // Verify APY conversions
    expect(transformedVault.baseApy).toBeCloseTo(
      Number.parseFloat(indexerVault.baseApy),
      10,
    );
    expect(transformedVault.rewardsApy).toBeCloseTo(
      Number.parseFloat(indexerVault.rewardsApy),
      10,
    );
    expect(transformedVault.totalApy).toBeCloseTo(
      Number.parseFloat(indexerVault.totalApy),
      10,
    );
  });

  // Test performance fee conversion (percentage to decimal)
  test("Verify performance fee is converted correctly", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVaults = transformVaultsFromIndexer(
      response.results,
      createBaseEnvironment(),
      tokenMap,
    );

    transformedVaults.forEach((vault, index) => {
      const indexerVault = response.results[index];
      // Performance fee should be converted from "15" (15%) to 0.15 (decimal)
      const expectedFee = Number.parseFloat(indexerVault.performanceFee) / 100;
      expect(vault.performanceFee).toBeCloseTo(expectedFee, 10);
      expect(vault.performanceFee).toBeGreaterThanOrEqual(0);
      expect(vault.performanceFee).toBeLessThanOrEqual(1);
    });
  });

  // Test timelock conversion (seconds to hours)
  test("Verify timelock is converted correctly", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVaults = transformVaultsFromIndexer(
      response.results,
      createBaseEnvironment(),
      tokenMap,
    );

    transformedVaults.forEach((vault, index) => {
      const indexerVault = response.results[index];
      // Timelock should be converted from seconds to hours
      const expectedTimelock =
        Number.parseInt(indexerVault.timelock) / (60 * 60);
      expect(vault.timelock).toBe(expectedTimelock);
    });
  });

  // Test market allocation calculation
  test("Verify market allocations are calculated correctly", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    const totalAssets = Number.parseFloat(indexerVault.totalAssets);

    transformedVault.markets.forEach((market, index) => {
      const indexerMarket = indexerVault.markets[index];
      const vaultSupplied = Number.parseFloat(indexerMarket.vaultSupplied);
      const expectedAllocation =
        totalAssets > 0 ? vaultSupplied / totalAssets : 0;

      expect(market.allocation).toBeCloseTo(expectedAllocation, 10);
    });

    // Total allocation should be approximately 1 (100%)
    const totalAllocation = transformedVault.markets.reduce(
      (sum, market) => sum + market.allocation,
      0,
    );
    if (transformedVault.markets.length > 0 && totalAssets > 0) {
      expect(totalAllocation).toBeGreaterThan(0);
      expect(totalAllocation).toBeLessThanOrEqual(1.01); // Allow small floating point error
    }
  });

  // Test V1 vs V2 vault detection
  test("Verify V1 and V2 vaults are detected correctly", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVaults = transformVaultsFromIndexer(
      response.results,
      createBaseEnvironment(),
      tokenMap,
    );

    // mwETH, mwUSDC, mwEURC should be V2 on Base
    const v2VaultAddresses = [
      "0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1", // mwETH
      "0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca", // mwUSDC
      "0xf24608e0ccb972b0b0f4a6446a0bbf58c701a026", // mwEURC
    ];

    const v2Vaults = transformedVaults.filter((v) =>
      v2VaultAddresses.includes(v.vaultToken.address.toLowerCase()),
    );

    v2Vaults.forEach((vault) => {
      expect(vault.version).toBe(2);
    });

    // mwcbBTC should be V1 (Frontier)
    const frontierVault = transformedVaults.find(
      (v) =>
        v.vaultToken.address.toLowerCase() ===
        "0x543257ef2161176d7c8cd90ba65c2d4caef5a796",
    );
    expect(frontierVault?.version).toBe(1);
  });

  // Test mwETH underlying token uses SDK config (ETH, not WETH)
  test("mwETH vault shows ETH as underlying, not WETH", async () => {
    const vaultId = "8453-0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(transformedVault.underlyingToken.symbol).toBe("ETH");
    expect(transformedVault.underlyingToken.name).toBe("Ethereum");
    expect(transformedVault.vaultKey).toBe("mwETH");
  });

  // Test meUSDCv1 vault name includes "V1" label from SDK config
  test("meUSDCv1 vault name includes V1 label", async () => {
    const vaultId = "8453-0xe1ba476304255353aef290e6474a417d06e7b773";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const transformedVault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(transformedVault.vaultToken.name).toBe(
      "Moonwell Ecosystem USDC Vault V1",
    );
    expect(transformedVault.vaultToken.symbol).toBe("meUSDCv1");
    expect(transformedVault.vaultKey).toBe("meUSDCv1");
  }, 15000);

  // Test vault sort order matches config key order
  test("Vaults sorted by config order: mwETH, mwUSDC, mwEURC, mwcbBTC, meUSDC, meUSDCv1", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);
    const environment = createBaseEnvironment();

    const transformedVaults = transformVaultsFromIndexer(
      response.results,
      environment,
      tokenMap,
    );

    // Apply the same sort logic used in getMorphoVaultsDataFromIndexer
    const vaultKeyOrder = Object.keys(environment.config.vaults);
    transformedVaults.sort((a, b) => {
      const indexA = vaultKeyOrder.indexOf(a.vaultKey);
      const indexB = vaultKeyOrder.indexOf(b.vaultKey);
      return (
        (indexA === -1 ? Number.POSITIVE_INFINITY : indexA) -
        (indexB === -1 ? Number.POSITIVE_INFINITY : indexB)
      );
    });

    const expectedOrder = [
      "mwETH",
      "mwUSDC",
      "mwEURC",
      "mwcbBTC",
      "meUSDC",
      "meUSDCv1",
    ];
    const knownVaults = transformedVaults.filter((v) =>
      expectedOrder.includes(v.vaultKey),
    );

    expect(knownVaults.map((v) => v.vaultKey)).toEqual(expectedOrder);
  });

  // Test that transformed output matches expected MorphoVault structure
  test("Verify transformed vault matches MorphoVault type structure", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    const vault = transformVaultFromIndexer(
      indexerVault,
      createBaseEnvironment(),
      tokenMap,
    );

    // All required fields from MorphoVault type
    const requiredFields = [
      "chainId",
      "vaultKey",
      "version",
      "deprecated",
      "vaultToken",
      "underlyingToken",
      "vaultSupply",
      "totalSupply",
      "totalSupplyUsd",
      "totalLiquidity",
      "totalLiquidityUsd",
      "totalStaked",
      "totalStakedUsd",
      "underlyingPrice",
      "baseApy",
      "rewardsApy",
      "totalApy",
      "stakingRewardsApr",
      "totalStakingApr",
      "performanceFee",
      "curators",
      "timelock",
      "markets",
      "rewards",
      "stakingRewards",
    ];

    requiredFields.forEach((field) => {
      expect(vault).toHaveProperty(field);
    });
  });

  // Test error handling for missing tokens
  test("Handle missing token gracefully with fallback", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const indexerVault = await fetchVaultFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    // Simulate missing token by removing it from the vault and using empty map
    const { underlyingToken: _, ...vaultWithoutToken } = indexerVault;
    const emptyTokenMap = new Map();

    // Should throw error if underlying token not found
    expect(() =>
      transformVaultFromIndexer(
        vaultWithoutToken,
        createBaseEnvironment(),
        emptyTokenMap,
      ),
    ).toThrow("Underlying token not found");
  });

  // Test with includeRewards parameter (when indexer adds support)
  test("Fetch vaults with includeRewards parameter", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
      { includeRewards: true },
    );

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();

    // Note: Currently rewards are empty in list view
    // This test will pass when indexer team adds rewards to list endpoint
    response.results.forEach((vault) => {
      expect(vault.rewards).toBeDefined();
      expect(Array.isArray(vault.rewards)).toBe(true);
    });
  });

  // Test fetching vault snapshots from Lunar Indexer
  test("Fetch vault snapshots from Lunar Indexer", async () => {
    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const response = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    // Check structure of first snapshot
    const snapshot = response.results[0];
    expect(snapshot.chainId).toBe(BASE_CHAIN_ID);
    expect(snapshot.vaultAddress).toBeDefined();
    expect(snapshot.timestamp).toBeDefined();
    expect(typeof snapshot.timestamp).toBe("number");
    expect(snapshot.totalAssets).toBeDefined();
    expect(snapshot.totalAssetsUsd).toBeDefined();
    expect(snapshot.totalLiquidity).toBeDefined();
    expect(snapshot.totalLiquidityUsd).toBeDefined();
    expect(snapshot.underlyingPrice).toBeDefined();
    expect(snapshot.baseApy).toBeDefined();
    expect(typeof snapshot.timeInterval).toBe("number");
  });

  // Test snapshot pagination
  test("Fetch vault snapshots supports pagination", async () => {
    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const firstPage = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    expect(firstPage.results.length).toBeGreaterThan(0);

    // If there's a next page, fetch it
    if (firstPage.nextCursor) {
      const secondPage = await fetchVaultSnapshotsFromIndexer(
        LUNAR_INDEXER_URL,
        vaultId,
        { cursor: firstPage.nextCursor },
      );

      expect(secondPage.results).toBeDefined();
      expect(Array.isArray(secondPage.results)).toBe(true);

      // Second page timestamps should be older than first page
      if (secondPage.results.length > 0) {
        const firstPageOldest =
          firstPage.results[firstPage.results.length - 1].timestamp;
        const secondPageNewest = secondPage.results[0].timestamp;
        expect(secondPageNewest).toBeLessThanOrEqual(firstPageOldest);
      }
    }
  });

  // Test snapshot transformation
  test("Transform vault snapshots from Lunar Indexer", async () => {
    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const response = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    const transformed = transformVaultSnapshotsFromIndexer(
      response.results,
      BASE_CHAIN_ID,
    );

    expect(transformed.length).toBe(response.results.length);

    transformed.forEach((snapshot, index) => {
      const raw = response.results[index];

      // Check chainId
      expect(snapshot.chainId).toBe(BASE_CHAIN_ID);

      // Check vaultAddress is lowercase
      expect(snapshot.vaultAddress).toBe(raw.vaultAddress.toLowerCase());

      // Check timestamp is converted to milliseconds
      expect(snapshot.timestamp).toBe(raw.timestamp * 1000);

      // Check totalSupply maps from totalAssets
      expect(snapshot.totalSupply).toBeCloseTo(
        Number.parseFloat(raw.totalAssets),
        6,
      );
      expect(snapshot.totalSupplyUsd).toBeCloseTo(
        Number.parseFloat(raw.totalAssetsUsd),
        6,
      );

      // Check totalLiquidity
      expect(snapshot.totalLiquidity).toBeCloseTo(
        Number.parseFloat(raw.totalLiquidity),
        6,
      );
      expect(snapshot.totalLiquidityUsd).toBeCloseTo(
        Number.parseFloat(raw.totalLiquidityUsd),
        6,
      );

      // Check totalBorrows = totalAssets - totalLiquidity
      const expectedBorrows =
        Number.parseFloat(raw.totalAssets) -
        Number.parseFloat(raw.totalLiquidity);
      expect(snapshot.totalBorrows).toBeCloseTo(expectedBorrows, 6);

      const expectedBorrowsUsd =
        Number.parseFloat(raw.totalAssetsUsd) -
        Number.parseFloat(raw.totalLiquidityUsd);
      expect(snapshot.totalBorrowsUsd).toBeCloseTo(expectedBorrowsUsd, 6);
    });
  });

  // Test snapshot MorphoVaultSnapshot type structure
  test("Verify transformed snapshots match MorphoVaultSnapshot type", async () => {
    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const response = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    const transformed = transformVaultSnapshotsFromIndexer(
      response.results,
      BASE_CHAIN_ID,
    );

    expect(transformed.length).toBeGreaterThan(0);

    const snapshot = transformed[0];
    const requiredFields = [
      "chainId",
      "vaultAddress",
      "totalSupply",
      "totalSupplyUsd",
      "totalBorrows",
      "totalBorrowsUsd",
      "totalLiquidity",
      "totalLiquidityUsd",
      "timestamp",
    ];

    requiredFields.forEach((field) => {
      expect(snapshot).toHaveProperty(field);
    });

    // All numeric values should be numbers
    expect(typeof snapshot.totalSupply).toBe("number");
    expect(typeof snapshot.totalSupplyUsd).toBe("number");
    expect(typeof snapshot.totalBorrows).toBe("number");
    expect(typeof snapshot.totalBorrowsUsd).toBe("number");
    expect(typeof snapshot.totalLiquidity).toBe("number");
    expect(typeof snapshot.totalLiquidityUsd).toBe("number");
    expect(typeof snapshot.timestamp).toBe("number");
  });
});
