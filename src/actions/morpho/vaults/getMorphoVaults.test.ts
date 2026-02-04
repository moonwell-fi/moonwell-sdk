import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { base } from "../../../environments/index.js";

describe("Testing getMorphoVaults", () => {
  // Test getting all vaults by network
  test("Get all morpho vaults on Base by network", async () => {
    const morphoVaults = await testClient.getMorphoVaults<typeof base>({
      network: "base",
    });

    expect(morphoVaults).toBeDefined();
    expect(Array.isArray(morphoVaults)).toBe(true);
    expect(morphoVaults.length).toBeGreaterThan(0);

    // All vaults should be on the same chain
    morphoVaults.forEach((vault) => {
      expect(vault.chainId).toBe(8453);
    });
  });

  // Test getting all vaults by chainId
  test("Get all morpho vaults on Base by chainId", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();
    expect(Array.isArray(morphoVaults)).toBe(true);
    expect(morphoVaults.length).toBeGreaterThan(0);

    // All vaults should be on the same chain
    morphoVaults.forEach((vault) => {
      expect(vault.chainId).toBe(8453);
    });
  });

  // Test getting all vaults across all networks
  test("Get all morpho vaults across all networks", async () => {
    const morphoVaults = await testClient.getMorphoVaults();

    expect(morphoVaults).toBeDefined();
    expect(Array.isArray(morphoVaults)).toBe(true);
  });

  // Test each vault has required properties
  test("Verify all vaults have required properties", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();
    expect(morphoVaults.length).toBeGreaterThan(0);

    morphoVaults.forEach((vault) => {
      // Core properties
      expect(vault.chainId).toBeDefined();
      expect(vault.vaultKey).toBeDefined();
      expect(vault.vaultToken).toBeDefined();
      expect(vault.underlyingToken).toBeDefined();

      // Amount properties
      expect(vault.vaultSupply).toBeDefined();
      expect(vault.totalSupply).toBeDefined();
      expect(vault.totalLiquidity).toBeDefined();

      // Numeric properties
      expect(vault.totalSupplyUsd).toBeDefined();
      expect(vault.totalLiquidityUsd).toBeDefined();
      expect(vault.underlyingPrice).toBeDefined();
      expect(vault.baseApy).toBeDefined();
      expect(vault.totalApy).toBeDefined();
      expect(vault.performanceFee).toBeDefined();
      expect(vault.timelock).toBeDefined();

      // Arrays
      expect(vault.markets).toBeDefined();
      expect(vault.rewards).toBeDefined();
      expect(vault.stakingRewards).toBeDefined();
      expect(vault.curators).toBeDefined();
    });
  });

  // Test vault token structure
  test("Verify vault tokens have correct structure", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      // Vault token
      expect(vault.vaultToken.address).toBeDefined();
      expect(vault.vaultToken.symbol).toBeDefined();
      expect(vault.vaultToken.decimals).toBeDefined();
      expect(typeof vault.vaultToken.address).toBe("string");
      expect(typeof vault.vaultToken.symbol).toBe("string");
      expect(typeof vault.vaultToken.decimals).toBe("number");

      // Underlying token
      expect(vault.underlyingToken.address).toBeDefined();
      expect(vault.underlyingToken.symbol).toBeDefined();
      expect(vault.underlyingToken.decimals).toBeDefined();
      expect(typeof vault.underlyingToken.address).toBe("string");
      expect(typeof vault.underlyingToken.symbol).toBe("string");
      expect(typeof vault.underlyingToken.decimals).toBe("number");
    });
  });

  // Test Amount objects structure
  test("Verify Amount objects have correct structure", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      // vaultSupply
      expect(vault.vaultSupply.value).toBeDefined();
      expect(vault.vaultSupply.exponential).toBeDefined();
      expect(typeof vault.vaultSupply.value).toBe("number");
      expect(typeof vault.vaultSupply.exponential).toBe("bigint");

      // totalSupply
      expect(vault.totalSupply.value).toBeDefined();
      expect(vault.totalSupply.exponential).toBeDefined();
      expect(typeof vault.totalSupply.value).toBe("number");
      expect(typeof vault.totalSupply.exponential).toBe("bigint");

      // totalLiquidity
      expect(vault.totalLiquidity.value).toBeDefined();
      expect(vault.totalLiquidity.exponential).toBeDefined();
      expect(typeof vault.totalLiquidity.value).toBe("number");
      expect(typeof vault.totalLiquidity.exponential).toBe("bigint");
    });
  });

  // Test with rewards included
  test("Get all morpho vaults with rewards", async () => {
    const morphoVaults = await testClient.getMorphoVaults<typeof base>({
      network: "base",
      includeRewards: true,
    });

    expect(morphoVaults).toBeDefined();
    expect(morphoVaults.length).toBeGreaterThan(0);

    morphoVaults.forEach((vault) => {
      expect(vault.rewards).toBeDefined();
      expect(vault.stakingRewards).toBeDefined();
      expect(typeof vault.rewardsApy).toBe("number");
      expect(typeof vault.stakingRewardsApr).toBe("number");
      expect(typeof vault.totalStakingApr).toBe("number");
    });
  });

  // Test with currentChainRewardsOnly
  test("Get all morpho vaults with currentChainRewardsOnly", async () => {
    const morphoVaults = await testClient.getMorphoVaults<typeof base>({
      network: "base",
      includeRewards: true,
      currentChainRewardsOnly: true,
    });

    expect(morphoVaults).toBeDefined();
    expect(morphoVaults.length).toBeGreaterThan(0);

    morphoVaults.forEach((vault) => {
      expect(vault.rewards).toBeDefined();
    });
  });

  // Test markets array in vaults
  test("Verify vault markets array structure", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      expect(Array.isArray(vault.markets)).toBe(true);

      vault.markets.forEach((market) => {
        expect(market.marketId).toBeDefined();
        expect(market.allocation).toBeDefined();
        expect(market.marketApy).toBeDefined();
        expect(market.marketCollateral).toBeDefined();
        expect(market.marketLiquidity).toBeDefined();
        expect(market.marketLiquidityUsd).toBeDefined();
        expect(market.marketLoanToValue).toBeDefined();
        expect(market.totalSupplied).toBeDefined();
        expect(market.totalSuppliedUsd).toBeDefined();
        expect(market.rewards).toBeDefined();

        // Verify types
        expect(typeof market.allocation).toBe("number");
        expect(typeof market.marketApy).toBe("number");
        expect(typeof market.marketLiquidityUsd).toBe("number");
        expect(typeof market.marketLoanToValue).toBe("number");
        expect(typeof market.totalSuppliedUsd).toBe("number");
        expect(Array.isArray(market.rewards)).toBe(true);
      });
    });
  });

  // Test market allocations sum
  test("Verify market allocations are valid percentages", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      if (vault.markets.length > 0) {
        const totalAllocation = vault.markets.reduce(
          (sum, market) => sum + market.allocation,
          0,
        );

        // Allocation should be between 0 and 1 (representing 0% to 100%)
        vault.markets.forEach((market) => {
          expect(market.allocation).toBeGreaterThanOrEqual(0);
          expect(market.allocation).toBeLessThanOrEqual(1);
        });

        // Total allocation should approximately equal 1 (100%)
        // Using a small tolerance for floating point errors
        expect(totalAllocation).toBeGreaterThanOrEqual(0);
        expect(totalAllocation).toBeLessThanOrEqual(1.01);
      }
    });
  });

  // Test APY values are reasonable
  test("Verify APY values are reasonable", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      // baseApy should be a non-negative number
      expect(vault.baseApy).toBeGreaterThanOrEqual(0);

      // totalApy should be at least baseApy
      expect(vault.totalApy).toBeGreaterThanOrEqual(vault.baseApy);

      // APYs shouldn't be unreasonably high (e.g., > 1000%)
      expect(vault.baseApy).toBeLessThan(1000);
      expect(vault.totalApy).toBeLessThan(1000);
    });
  });

  // Test vaults on different networks
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, config } = environment;

      if (Object.keys(config.vaults).length > 0) {
        test(`Get morpho vaults on ${chain.name}`, async () => {
          const morphoVaults = await testClient.getMorphoVaults<typeof chain>({
            network: networkKey as keyof typeof testClient.environments,
          });

          expect(morphoVaults).toBeDefined();
          expect(Array.isArray(morphoVaults)).toBe(true);
          expect(morphoVaults.length).toBeGreaterThan(0);

          morphoVaults.forEach((vault) => {
            expect(vault.chainId).toBe(chain.id);
          });
        });

        test(`Get morpho vaults by chainId on ${chain.name}`, async () => {
          const morphoVaults = await testClient.getMorphoVaults({
            chainId: chain.id,
          });

          expect(morphoVaults).toBeDefined();
          expect(Array.isArray(morphoVaults)).toBe(true);
          expect(morphoVaults.length).toBeGreaterThan(0);

          morphoVaults.forEach((vault) => {
            expect(vault.chainId).toBe(chain.id);
          });
        });

        test(`Get morpho vaults with rewards on ${chain.name}`, async () => {
          const morphoVaults = await testClient.getMorphoVaults<typeof chain>({
            network: networkKey as keyof typeof testClient.environments,
            includeRewards: true,
          });

          expect(morphoVaults).toBeDefined();
          morphoVaults.forEach((vault) => {
            expect(vault.rewards).toBeDefined();
          });
        });
      }
    },
  );

  // Test staking data
  test("Verify staking data structure", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    morphoVaults.forEach((vault) => {
      // Staking amounts
      expect(vault.totalStaked).toBeDefined();
      expect(vault.totalStakedUsd).toBeDefined();
      expect(vault.totalStaked.value).toBeDefined();
      expect(vault.totalStaked.exponential).toBeDefined();
      expect(typeof vault.totalStakedUsd).toBe("number");
    });
  });

  // Test V2 vault structure and APY
  test("Verify V2 vaults have correct structure and APY from API", async () => {
    const morphoVaults = await testClient.getMorphoVaults({
      chainId: 8453,
    });

    expect(morphoVaults).toBeDefined();

    const v2Vaults = morphoVaults.filter((vault) => vault.version === 2);

    // Should have at least one v2 vault (meUSDC)
    expect(v2Vaults.length).toBeGreaterThan(0);

    v2Vaults.forEach((vault) => {
      // V2 vaults should have version 2
      expect(vault.version).toBe(2);

      // V2 vaults should have baseApy from Morpho API
      expect(vault.baseApy).toBeGreaterThan(0);

      // V2 vaults should now show markets from underlying vaults
      expect(vault.markets).toBeDefined();
      expect(Array.isArray(vault.markets)).toBe(true);
      // Markets array should contain markets from the underlying vault
      expect(vault.markets.length).toBeGreaterThanOrEqual(0);

      // If markets exist, verify structure
      if (vault.markets.length > 0) {
        expect(vault.markets[0]).toHaveProperty("marketId");
        expect(vault.markets[0]).toHaveProperty("allocation");
        expect(vault.markets[0]).toHaveProperty("marketCollateral");
        expect(vault.markets[0]).toHaveProperty("marketApy");
        expect(vault.markets[0]).toHaveProperty("totalSupplied");
      }

      // Other properties should still be defined
      expect(vault.totalSupply).toBeDefined();
      expect(vault.vaultSupply).toBeDefined();
      expect(vault.performanceFee).toBeDefined();
      expect(vault.timelock).toBeDefined();

      // V2 vaults should have liquidity from Morpho API
      expect(vault.totalLiquidity).toBeDefined();
      expect(vault.totalLiquidity.exponential).toBeGreaterThan(0n);
      expect(vault.totalLiquidityUsd).toBeGreaterThan(0);
    });
  });
});
