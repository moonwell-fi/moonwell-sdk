import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing proposals", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, contracts } = environment;
      test(`Get proposals on ${chain.name}`, async () => {
        const proposalData = await testClient.getProposals<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
        });
        if ("governor" in contracts && contracts.governor) {
          expect(proposalData).not.toHaveLength(0);
        } else {
          expect(proposalData).toHaveLength(0);
        }
      });
    },
  );
});
