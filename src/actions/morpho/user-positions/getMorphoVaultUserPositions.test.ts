import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { base } from "../../../environments/index.js";

// Test addresses with known positions - can be updated if needed
const TEST_USER_ADDRESS = "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8";

describe("Testing getMorphoVaultUserPositions", () => {
  // Test getting all user positions by network
  test("Get all morpho vault user positions on Base by network", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();
    expect(Array.isArray(userPositions)).toBe(true);

    // All positions should be on the same chain
    userPositions.forEach((position) => {
      expect(position.chainId).toBe(8453);
      expect(position.account).toBe(TEST_USER_ADDRESS);
    });
  });

  // Test getting all user positions by chainId
  test("Get all morpho vault user positions on Base by chainId", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions({
      chainId: 8453,
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();
    expect(Array.isArray(userPositions)).toBe(true);

    // All positions should be on the same chain
    userPositions.forEach((position) => {
      expect(position.chainId).toBe(8453);
      expect(position.account).toBe(TEST_USER_ADDRESS);
    });
  });

  // Test getting all user positions across all networks
  test("Get all morpho vault user positions across all networks", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions({
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();
    expect(Array.isArray(userPositions)).toBe(true);
  });

  // Test each position has required properties
  test("Verify all positions have required properties", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      // Core properties
      expect(position.chainId).toBeDefined();
      expect(position.account).toBeDefined();
      expect(position.vaultToken).toBeDefined();
      expect(position.underlyingToken).toBeDefined();

      // Amount properties
      expect(position.supplied).toBeDefined();
      expect(position.suppliedShares).toBeDefined();
    });
  });

  // Test vault token structure
  test("Verify vault tokens have correct structure", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      // Vault token
      expect(position.vaultToken.address).toBeDefined();
      expect(position.vaultToken.symbol).toBeDefined();
      expect(position.vaultToken.decimals).toBeDefined();
      expect(typeof position.vaultToken.address).toBe("string");
      expect(typeof position.vaultToken.symbol).toBe("string");
      expect(typeof position.vaultToken.decimals).toBe("number");

      // Underlying token
      expect(position.underlyingToken.address).toBeDefined();
      expect(position.underlyingToken.symbol).toBeDefined();
      expect(position.underlyingToken.decimals).toBeDefined();
      expect(typeof position.underlyingToken.address).toBe("string");
      expect(typeof position.underlyingToken.symbol).toBe("string");
      expect(typeof position.underlyingToken.decimals).toBe("number");
    });
  });

  // Test Amount objects structure
  test("Verify Amount objects have correct structure", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      // supplied
      expect(position.supplied.value).toBeDefined();
      expect(position.supplied.exponential).toBeDefined();
      expect(typeof position.supplied.value).toBe("number");
      expect(typeof position.supplied.exponential).toBe("bigint");

      // suppliedShares
      expect(position.suppliedShares.value).toBeDefined();
      expect(position.suppliedShares.exponential).toBeDefined();
      expect(typeof position.suppliedShares.value).toBe("number");
      expect(typeof position.suppliedShares.exponential).toBe("bigint");
    });
  });

  // Test supplied values are non-negative
  test("Verify supplied values are non-negative", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      expect(position.supplied.value).toBeGreaterThanOrEqual(0);
      expect(position.suppliedShares.value).toBeGreaterThanOrEqual(0);
    });
  });

  // Test positions on different networks
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, config } = environment;

      if (Object.keys(config.vaults).length > 0) {
        test(`Get morpho vault user positions on ${chain.name}`, async () => {
          const userPositions = await testClient.getMorphoVaultUserPositions<
            typeof chain
          >({
            network: networkKey as keyof typeof testClient.environments,
            userAddress: TEST_USER_ADDRESS,
          });

          expect(userPositions).toBeDefined();
          expect(Array.isArray(userPositions)).toBe(true);

          userPositions.forEach((position) => {
            expect(position.chainId).toBe(chain.id);
            expect(position.account).toBe(TEST_USER_ADDRESS);
          });
        });

        test(`Get morpho vault user positions by chainId on ${chain.name}`, async () => {
          const userPositions = await testClient.getMorphoVaultUserPositions({
            chainId: chain.id,
            userAddress: TEST_USER_ADDRESS,
          });

          expect(userPositions).toBeDefined();
          expect(Array.isArray(userPositions)).toBe(true);

          userPositions.forEach((position) => {
            expect(position.chainId).toBe(chain.id);
            expect(position.account).toBe(TEST_USER_ADDRESS);
          });
        });
      }
    },
  );

  // Test user with no positions
  test("Get positions for user with no deposits", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(userPositions).toBeDefined();
    expect(Array.isArray(userPositions)).toBe(true);

    // User with no position should have zero supplied for all positions
    userPositions.forEach((position) => {
      expect(position.supplied.value).toBe(0);
      expect(position.suppliedShares.value).toBe(0);
    });
  });

  // Test consistency between single and multiple position calls
  test("Verify consistency between single and multiple position calls", async () => {
    const allPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(allPositions).toBeDefined();

    if (allPositions.length > 0) {
      // Get the first vault address from the positions
      const firstPosition = allPositions[0];

      // Get the single position for that vault
      const singlePosition = await testClient.getMorphoVaultUserPosition({
        chainId: 8453,
        vaultAddress: firstPosition.vaultToken.address,
        userAddress: TEST_USER_ADDRESS,
      });

      expect(singlePosition).toBeDefined();

      if (singlePosition) {
        // Values should match
        expect(singlePosition.vaultToken.address).toBe(
          firstPosition.vaultToken.address,
        );
        expect(singlePosition.supplied.value).toBe(
          firstPosition.supplied.value,
        );
        expect(singlePosition.suppliedShares.value).toBe(
          firstPosition.suppliedShares.value,
        );
      }
    }
  });

  // Test comparing positions with vault data
  test("Verify positions match available vaults", async () => {
    const vaults = await testClient.getMorphoVaults<typeof base>({
      network: "base",
    });

    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(vaults).toBeDefined();
    expect(userPositions).toBeDefined();

    // Number of positions should match number of vaults
    expect(userPositions.length).toBe(vaults.length);

    // Each position vault token should match a vault
    userPositions.forEach((position) => {
      const matchingVault = vaults.find(
        (vault) => vault.vaultToken.address === position.vaultToken.address,
      );
      expect(matchingVault).toBeDefined();
    });
  });

  // Test consistency between supplied and shares
  test("Verify consistency between supplied and shares for all positions", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      // If shares is 0, supplied should also be 0
      if (position.suppliedShares.value === 0) {
        expect(position.supplied.value).toBe(0);
      }

      // If shares is positive, supplied should also be positive
      if (position.suppliedShares.value > 0) {
        expect(position.supplied.value).toBeGreaterThan(0);
      }
    });
  });

  // Test unique vault addresses
  test("Verify each position has a unique vault address", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    const vaultAddresses = userPositions.map(
      (position) => position.vaultToken.address,
    );
    const uniqueAddresses = new Set(vaultAddresses);

    expect(uniqueAddresses.size).toBe(vaultAddresses.length);
  });

  // Test account address is consistent across all positions
  test("Verify account address is consistent across all positions", async () => {
    const userPositions = await testClient.getMorphoVaultUserPositions<
      typeof base
    >({
      network: "base",
      userAddress: TEST_USER_ADDRESS,
    });

    expect(userPositions).toBeDefined();

    userPositions.forEach((position) => {
      expect(position.account.toLowerCase()).toBe(
        TEST_USER_ADDRESS.toLowerCase(),
      );
    });
  });

  // Test multi-network position aggregation
  test("Verify multi-network position aggregation", async () => {
    const allPositions = await testClient.getMorphoVaultUserPositions({
      userAddress: TEST_USER_ADDRESS,
    });

    expect(allPositions).toBeDefined();
    expect(Array.isArray(allPositions)).toBe(true);

    // Group positions by chainId
    const positionsByChain = allPositions.reduce(
      (acc, position) => {
        if (!acc[position.chainId]) {
          acc[position.chainId] = [];
        }
        acc[position.chainId].push(position);
        return acc;
      },
      {} as Record<number, typeof allPositions>,
    );

    // Verify each chain's positions
    for (const [chainId, positions] of Object.entries(positionsByChain)) {
      positions.forEach((position) => {
        expect(position.chainId).toBe(Number(chainId));
      });
    }
  });
});
