import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing user staking info", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user staking info on ${chain.name}`, async () => {
        const userStakingInfo = await testClient.getUserStakingInfo<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0x0000000000000000000000000000000000000000",
        });
        expect(userStakingInfo).toBeDefined();
        expect(userStakingInfo.length).toBeGreaterThan(0);
      });
      test(`Get user staking info by chain id on ${chain.name}`, async () => {
        const userStakingInfo = await testClient.getUserStakingInfo({
          chainId: chain.id,
          userAddress: "0x0000000000000000000000000000000000000000",
        });
        expect(userStakingInfo).toBeDefined();
        expect(userStakingInfo.length).toBeGreaterThan(0);
      });
    },
  );
});
