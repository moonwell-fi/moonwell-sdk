import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing proposals", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, contracts } = environment;
      test(`Get proposal on ${chain.name}`, async () => {
        const proposalData = await testClient.getProposal<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          proposalId: 1,
        });
        if ("governor" in contracts && contracts.governor) {
          expect(proposalData).toBeDefined();
        } else {
          expect(proposalData).toBeUndefined();
        }
      });
    },
  );
});
