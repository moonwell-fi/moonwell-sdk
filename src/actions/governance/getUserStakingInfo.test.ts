import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing user staking info", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;
      // Some chains in the test client (Arbitrum, Avalanche, Polygon) host no
      // staking contracts — getUserStakingInfo correctly returns [] for them,
      // so gate the strict assertion the same way getStakingSnapshots.test.ts does.
      const hasStaking = "stakingToken" in environment.config.contracts;

      test(`Get user staking info on ${chain.name}`, async () => {
        const userStakingInfo = await testClient.getUserStakingInfo<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0x0000000000000000000000000000000000000000",
        });
        expect(userStakingInfo).toBeDefined();
        if (hasStaking) {
          expect(userStakingInfo.length).toBeGreaterThan(0);
        } else {
          expect(userStakingInfo).toHaveLength(0);
        }
      });
      test(`Get user staking info by chain id on ${chain.name}`, async () => {
        const userStakingInfo = await testClient.getUserStakingInfo({
          chainId: chain.id,
          userAddress: "0x0000000000000000000000000000000000000000",
        });
        expect(userStakingInfo).toBeDefined();
        if (hasStaking) {
          expect(userStakingInfo.length).toBeGreaterThan(0);
        } else {
          expect(userStakingInfo).toHaveLength(0);
        }
      });
    },
  );
});
