import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { base } from "../../../environments/index.js";

// Test addresses with known positions - can be updated if needed
const TEST_USER_ADDRESS = "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8";

describe("Testing getMorphoVaultUserPosition", () => {
  // Test getting user position by network and vault name
  test("Get morpho vault user position on Base by vault name", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      expect(userPosition.chainId).toBe(8453);
      expect(userPosition.account).toBe(TEST_USER_ADDRESS);
    }
  });

  // Test getting user position by chainId and vaultAddress
  test("Get morpho vault user position by chainId and vaultAddress", async () => {
    const vaults = await testClient.getMorphoVaults({ chainId: 8453 });
    const firstVault = vaults[0];

    if (firstVault) {
      const userPosition = await testClient.getMorphoVaultUserPosition({
        chainId: 8453,
        vaultAddress: firstVault.vaultToken.address,
        userAddress: TEST_USER_ADDRESS,
      });

      expect(userPosition).toBeDefined();

      if (userPosition) {
        expect(userPosition.chainId).toBe(8453);
        expect(userPosition.account).toBe(TEST_USER_ADDRESS);
        expect(userPosition.vaultToken.address).toBe(
          firstVault.vaultToken.address,
        );
      }
    }
  });

  // Test user position data structure
  test("Verify user position data structure", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      // Verify required properties exist
      expect(userPosition.chainId).toBeDefined();
      expect(userPosition.account).toBeDefined();
      expect(userPosition.vaultToken).toBeDefined();
      expect(userPosition.underlyingToken).toBeDefined();
      expect(userPosition.supplied).toBeDefined();
      expect(userPosition.suppliedShares).toBeDefined();

      // Verify types
      expect(typeof userPosition.chainId).toBe("number");
      expect(typeof userPosition.account).toBe("string");
    }
  });

  // Test vault token structure
  test("Verify vault token structure in user position", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      // Vault token
      expect(userPosition.vaultToken.address).toBeDefined();
      expect(userPosition.vaultToken.symbol).toBeDefined();
      expect(userPosition.vaultToken.decimals).toBeDefined();
      expect(typeof userPosition.vaultToken.address).toBe("string");
      expect(typeof userPosition.vaultToken.symbol).toBe("string");
      expect(typeof userPosition.vaultToken.decimals).toBe("number");

      // Underlying token
      expect(userPosition.underlyingToken.address).toBeDefined();
      expect(userPosition.underlyingToken.symbol).toBeDefined();
      expect(userPosition.underlyingToken.decimals).toBeDefined();
      expect(typeof userPosition.underlyingToken.address).toBe("string");
      expect(typeof userPosition.underlyingToken.symbol).toBe("string");
      expect(typeof userPosition.underlyingToken.decimals).toBe("number");
    }
  });

  // Test Amount objects structure
  test("Verify Amount objects structure in user position", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      // supplied
      expect(userPosition.supplied.value).toBeDefined();
      expect(userPosition.supplied.exponential).toBeDefined();
      expect(typeof userPosition.supplied.value).toBe("number");
      expect(typeof userPosition.supplied.exponential).toBe("bigint");

      // suppliedShares
      expect(userPosition.suppliedShares.value).toBeDefined();
      expect(userPosition.suppliedShares.exponential).toBeDefined();
      expect(typeof userPosition.suppliedShares.value).toBe("number");
      expect(typeof userPosition.suppliedShares.exponential).toBe("bigint");
    }
  });

  // Test supplied values are non-negative
  test("Verify supplied values are non-negative", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      expect(userPosition.supplied.value).toBeGreaterThanOrEqual(0);
      expect(userPosition.suppliedShares.value).toBeGreaterThanOrEqual(0);
    }
  });

  // Test different vaults on Base
  test("Get morpho vault user position for mwETH on Base", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwETH",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      expect(userPosition.chainId).toBe(8453);
      expect(userPosition.underlyingToken.symbol).toBe("ETH");
    }
  });

  // Test vaults on different networks
  Object.entries(testClient.environments).forEach(([_, environment]) => {
    const { chain, config } = environment;

    if (Object.keys(config.vaults).length > 0) {
      test(`Get morpho vault user position on ${chain.name}`, async () => {
        const vaults = await testClient.getMorphoVaults({
          chainId: chain.id,
        });

        if (vaults.length > 0) {
          const userPosition = await testClient.getMorphoVaultUserPosition({
            chainId: chain.id,
            vaultAddress: vaults[0].vaultToken.address,
            userAddress: TEST_USER_ADDRESS,
          });

          expect(userPosition).toBeDefined();

          if (userPosition) {
            expect(userPosition.chainId).toBe(chain.id);
            expect(userPosition.account).toBe(TEST_USER_ADDRESS);
          }
        }
      });
    }
  });

  // Test user with no position (zero address typically has no position)
  test("Get user position for address with no deposits", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      // User with no position should have zero supplied
      expect(userPosition.supplied.value).toBe(0);
      expect(userPosition.suppliedShares.value).toBe(0);
    }
  });

  // Test consistency between supplied and shares
  test("Verify consistency between supplied and shares", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      // If shares is 0, supplied should also be 0
      if (userPosition.suppliedShares.value === 0) {
        expect(userPosition.supplied.value).toBe(0);
      }

      // If shares is positive, supplied should also be positive
      if (userPosition.suppliedShares.value > 0) {
        expect(userPosition.supplied.value).toBeGreaterThan(0);
      }
    }
  });

  // Test account address is returned correctly
  test("Verify account address is returned correctly", async () => {
    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPosition).toBeDefined();

    if (userPosition) {
      expect(userPosition.account.toLowerCase()).toBe(
        TEST_USER_ADDRESS.toLowerCase(),
      );
    }
  });

  // Test comparing user position with vault data
  test("Verify user position against vault data", async () => {
    const vault = await testClient.getMorphoVault<typeof base>({
      network: "base",
      vault: "mwUSDC",
    });

    const userPosition = await testClient.getMorphoVaultUserPosition<
      typeof base
    >({
      network: "base",
      vault: "mwUSDC",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(vault).toBeDefined();
    expect(userPosition).toBeDefined();

    if (vault && userPosition) {
      // User position vault token should match vault's vault token
      expect(userPosition.vaultToken.address).toBe(vault.vaultToken.address);

      // User position underlying token should match vault's underlying token
      expect(userPosition.underlyingToken.address).toBe(
        vault.underlyingToken.address,
      );

      // User supplied should not exceed vault's total supply
      // (with some tolerance for timing differences)
      expect(userPosition.supplied.value).toBeLessThanOrEqual(
        vault.totalSupply.value * 1.01,
      );
    }
  });
});
