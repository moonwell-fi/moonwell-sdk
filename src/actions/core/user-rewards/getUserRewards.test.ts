import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

Object.entries(testClient.environments).forEach(([networkKey, environment]) => {
  const { chain } = environment;

  describe(`Testing user rewards on ${chain.name}`, async () => {
    test("Get user rewards", async () => {
      const userRewardData = await testClient.getUserRewards<typeof chain>({
        network: networkKey as keyof typeof testClient.environments,
        userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
      });
      expect(userRewardData).toBeDefined();
    });

    test("Get user rewards by chain id", async () => {
      const userRewardData = await testClient.getUserRewards({
        chainId: chain.id,
        userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
      });
      expect(userRewardData).toBeDefined();
    });
  });
});
