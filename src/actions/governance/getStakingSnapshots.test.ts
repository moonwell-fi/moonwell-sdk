import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing staking snapshots", () => {
  test("Get staking snapshots", async () => {
    const stakingSnapshots = await testClient.getStakingSnapshots();
    expect(stakingSnapshots).toBeDefined();
    expect(stakingSnapshots.length).toBe(0);
  });
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get staking snapshots on ${chain.name}`, async () => {
        const stakingSnapshots = await testClient.getStakingSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(stakingSnapshots).toBeDefined();
        expect(stakingSnapshots.length).toBeGreaterThan(0);
      });
      test(`Get staking snapshots by chain id on ${chain.name}`, async () => {
        const stakingSnapshots = await testClient.getStakingSnapshots({
          chainId: chain.id,
        });
        expect(stakingSnapshots).toBeDefined();
        expect(stakingSnapshots.length).toBeGreaterThan(0);
      });
    },
  );
});
