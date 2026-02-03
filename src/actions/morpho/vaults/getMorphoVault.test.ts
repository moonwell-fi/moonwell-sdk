import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type {
  GetEnvironment,
  VaultsType,
} from "../../../environments/index.js";
import type { base } from "../../../environments/index.js";

describe("Testing getMorphoVault", () => {
  // Test getting vault by network and vault name
  test("Get morpho vault on Base by vault name", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
    });

    expect(morphoVault).toBeDefined();
    expect(morphoVault?.vaultKey).toBe("mwUSDC");
    expect(morphoVault?.chainId).toBe(8453);
  });

  // Test getting vault by chainId and vaultAddress
  test("Get morpho vault by chainId and vaultAddress", async () => {
    const vaults = await testClient.getMorphoVaults({ chainId: 8453 });
    const firstVault = vaults[0];

    if (firstVault) {
      const morphoVault = await testClient.getMorphoVault({
        chainId: 8453,
        vaultAddress: firstVault.vaultToken.address,
      });

      expect(morphoVault).toBeDefined();
      expect(morphoVault?.chainId).toBe(8453);
      expect(morphoVault?.vaultToken.address).toBe(
        firstVault.vaultToken.address,
      );
    }
  });

  // Test vault data structure
  test("Verify vault data structure", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
    });

    expect(morphoVault).toBeDefined();

    // Verify required properties exist
    expect(morphoVault?.chainId).toBeDefined();
    expect(morphoVault?.vaultKey).toBeDefined();
    expect(morphoVault?.vaultToken).toBeDefined();
    expect(morphoVault?.underlyingToken).toBeDefined();
    expect(morphoVault?.vaultSupply).toBeDefined();
    expect(morphoVault?.totalSupply).toBeDefined();
    expect(morphoVault?.totalSupplyUsd).toBeDefined();
    expect(morphoVault?.totalLiquidity).toBeDefined();
    expect(morphoVault?.totalLiquidityUsd).toBeDefined();
    expect(morphoVault?.underlyingPrice).toBeDefined();
    expect(morphoVault?.baseApy).toBeDefined();
    expect(morphoVault?.totalApy).toBeDefined();
    expect(morphoVault?.performanceFee).toBeDefined();
    expect(morphoVault?.timelock).toBeDefined();
    expect(morphoVault?.markets).toBeDefined();
    expect(morphoVault?.rewards).toBeDefined();

    // Verify token structure
    expect(morphoVault?.vaultToken.address).toBeDefined();
    expect(morphoVault?.vaultToken.symbol).toBeDefined();
    expect(morphoVault?.vaultToken.decimals).toBeDefined();
    expect(morphoVault?.underlyingToken.address).toBeDefined();
    expect(morphoVault?.underlyingToken.symbol).toBeDefined();
    expect(morphoVault?.underlyingToken.decimals).toBeDefined();

    // Verify Amount objects
    expect(morphoVault?.vaultSupply.value).toBeDefined();
    expect(morphoVault?.vaultSupply.exponential).toBeDefined();
    expect(morphoVault?.totalSupply.value).toBeDefined();
    expect(morphoVault?.totalSupply.exponential).toBeDefined();
    expect(morphoVault?.totalLiquidity.value).toBeDefined();
    expect(morphoVault?.totalLiquidity.exponential).toBeDefined();

    // Verify numeric properties are numbers
    expect(typeof morphoVault?.totalSupplyUsd).toBe("number");
    expect(typeof morphoVault?.totalLiquidityUsd).toBe("number");
    expect(typeof morphoVault?.underlyingPrice).toBe("number");
    expect(typeof morphoVault?.baseApy).toBe("number");
    expect(typeof morphoVault?.totalApy).toBe("number");
    expect(typeof morphoVault?.performanceFee).toBe("number");
    expect(typeof morphoVault?.timelock).toBe("number");

    // Verify arrays
    expect(Array.isArray(morphoVault?.markets)).toBe(true);
    expect(Array.isArray(morphoVault?.rewards)).toBe(true);
    expect(Array.isArray(morphoVault?.stakingRewards)).toBe(true);
  });

  // Test vault markets structure
  test("Verify vault markets structure", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
    });

    expect(morphoVault).toBeDefined();
    expect(morphoVault?.markets).toBeDefined();

    if (morphoVault && morphoVault.markets.length > 0) {
      const market = morphoVault.markets[0];

      // Verify market structure
      expect(market?.marketId).toBeDefined();
      expect(market?.allocation).toBeDefined();
      expect(market?.marketApy).toBeDefined();
      expect(market?.marketCollateral).toBeDefined();
      expect(market?.marketLiquidity).toBeDefined();
      expect(market?.marketLiquidityUsd).toBeDefined();
      expect(market?.marketLoanToValue).toBeDefined();
      expect(market?.totalSupplied).toBeDefined();
      expect(market?.totalSuppliedUsd).toBeDefined();
      expect(market?.rewards).toBeDefined();

      // Verify market numeric properties
      expect(typeof market?.allocation).toBe("number");
      expect(typeof market?.marketApy).toBe("number");
      expect(typeof market?.marketLiquidityUsd).toBe("number");
      expect(typeof market?.marketLoanToValue).toBe("number");
      expect(typeof market?.totalSuppliedUsd).toBe("number");

      // Verify Amount objects in market
      expect(market?.marketLiquidity.value).toBeDefined();
      expect(market?.totalSupplied.value).toBeDefined();
    }
  });

  // Test with rewards included
  test("Get morpho vault with rewards", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
      includeRewards: true,
    });

    expect(morphoVault).toBeDefined();
    expect(morphoVault?.rewards).toBeDefined();
    expect(morphoVault?.stakingRewards).toBeDefined();
    expect(morphoVault?.rewardsApy).toBeDefined();
    expect(morphoVault?.stakingRewardsApr).toBeDefined();
    expect(morphoVault?.totalStakingApr).toBeDefined();

    expect(typeof morphoVault?.rewardsApy).toBe("number");
    expect(typeof morphoVault?.stakingRewardsApr).toBe("number");
    expect(typeof morphoVault?.totalStakingApr).toBe("number");
  });

  // Test with currentChainRewardsOnly
  test("Get morpho vault with currentChainRewardsOnly", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
      includeRewards: true,
      currentChainRewardsOnly: true,
    });

    expect(morphoVault).toBeDefined();
    expect(morphoVault?.rewards).toBeDefined();
  });

  // Test different vaults on Base
  test("Get morpho vault mwETH on Base", async () => {
    const morphoVault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwETH",
    });

    expect(morphoVault).toBeDefined();
    expect(morphoVault?.vaultKey).toBe("mwETH");
    expect(morphoVault?.underlyingToken.symbol).toBe("ETH");
  });

  // Test vaults on different networks
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, config } = environment;

      if (Object.keys(config.vaults).length > 0) {
        test(`Get first morpho vault on ${chain.name}`, async () => {
          const vaultKey = Object.keys(config.vaults)[0];
          const morphoVault = await testClient.getMorphoVault<typeof chain>({
            network: networkKey as keyof typeof testClient.environments,
            vault: vaultKey as keyof VaultsType<GetEnvironment<typeof chain>>,
          });

          expect(morphoVault).toBeDefined();
          expect(morphoVault?.chainId).toBe(chain.id);
        });
      }
    },
  );

  // Test non-existent vault returns undefined
  test("Get non-existent vault by invalid address", async () => {
    const morphoVault = await testClient.getMorphoVault({
      chainId: 8453,
      vaultAddress: "0x0000000000000000000000000000000000000000",
    });

    expect(morphoVault).toBeUndefined();
  });
});
