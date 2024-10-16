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

      test(`Get staking info on ${chain.name}`, async () => {
        const stakingInfo = await testClient.getStakingInfo<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(stakingInfo).toBeDefined();
        expect(stakingInfo.length).toBeGreaterThan(0);
      });
      test(`Get staking info by chain id on ${chain.name}`, async () => {
        const stakingInfo = await testClient.getStakingInfo({
          chainId: chain.id,
        });
        expect(stakingInfo).toBeDefined();
        expect(stakingInfo.length).toBeGreaterThan(0);
      });
    },
  );
});
