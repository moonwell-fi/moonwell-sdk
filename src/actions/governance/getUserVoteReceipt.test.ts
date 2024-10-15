import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing user vote receipt", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user vote receipt on ${chain.name}`, async () => {
        const userVoteReceipt = await testClient.getUserVoteReceipt<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0x0000000000000000000000000000000000000000",
          proposalId: 1,
        });
        expect(userVoteReceipt).toBeDefined();
        expect(userVoteReceipt.length).toBeGreaterThan(0);
      });
      test(`Get user vote receipt by chain id on ${chain.name}`, async () => {
        const userVoteReceipt = await testClient.getUserVoteReceipt({
          chainId: chain.id,
          userAddress: "0x0000000000000000000000000000000000000000",
          proposalId: 1,
        });
        expect(userVoteReceipt).toBeDefined();
        expect(userVoteReceipt.length).toBeGreaterThan(0);
      });
    },
  );
});
