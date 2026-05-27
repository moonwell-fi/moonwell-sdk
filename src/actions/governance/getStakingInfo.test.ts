import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing staking info", () => {
  test("Get staking info", async () => {
    const stakingInfo = await testClient.getStakingInfo();
    expect(stakingInfo).toBeDefined();
    expect(stakingInfo.length).toBeGreaterThan(0);
  });
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;
      // Some chains in the test client (Arbitrum, Avalanche, Polygon) host no
      // staking contracts — getStakingInfo correctly returns [] for them, so
      // gate the strict assertion the same way getStakingSnapshots.test.ts does.
      const hasStaking = "stakingToken" in environment.config.contracts;

      test(`Get staking info on ${chain.name}`, async () => {
        const stakingInfo = await testClient.getStakingInfo<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(stakingInfo).toBeDefined();
        if (hasStaking) {
          expect(stakingInfo.length).toBeGreaterThan(0);
        } else {
          expect(stakingInfo).toHaveLength(0);
        }
      });
      test(`Get staking info by chain id on ${chain.name}`, async () => {
        const stakingInfo = await testClient.getStakingInfo({
          chainId: chain.id,
        });
        expect(stakingInfo).toBeDefined();
        if (hasStaking) {
          expect(stakingInfo.length).toBeGreaterThan(0);
        } else {
          expect(stakingInfo).toHaveLength(0);
        }
      });
    },
  );
});
