import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { base } from "../../../environments/index.js";

describe("Testing Morpho Vault User Positions Snapshots", async () => {
  test("Get user positions on Base", async () => {
    const userPositionData =
      await testClient.getMorphoVaultUserPositionSnapshots<typeof base>({
        network: "base",
        vault: "mwUSDC",
        userAddress: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
      });

    console.log(userPositionData);
    expect(userPositionData).toBeDefined();
  });
});
