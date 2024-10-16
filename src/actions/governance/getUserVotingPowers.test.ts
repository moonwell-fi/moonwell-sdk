import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing user voting powers", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user voting powers on ${chain.name}`, async () => {
        const userVotingPowers = await testClient.getUserVotingPowers<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0x0000000000000000000000000000000000000000",
          governanceToken: "WELL",
        });
        expect(userVotingPowers).toBeDefined();
        expect(userVotingPowers.length).toBeGreaterThan(0);
      });
      test(`Get user voting powers by chain id on ${chain.name}`, async () => {
        const userVotingPowers = await testClient.getUserVotingPowers({
          chainId: chain.id,
          userAddress: "0x0000000000000000000000000000000000000000",
          governanceToken: "WELL",
        });
        expect(userVotingPowers).toBeDefined();
        expect(userVotingPowers.length).toBeGreaterThan(0);
      });
    },
  );
});
