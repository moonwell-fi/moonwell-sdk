import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing snapshot proposals", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get snapshot proposals on ${chain.name}`, async () => {
        const snapshotProposals = await testClient.getSnapshotProposals<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(snapshotProposals).toBeDefined();
      });
      test(`Get snapshot proposal by chain id on ${chain.name}`, async () => {
        const snapshotProposals = await testClient.getSnapshotProposals({
          chainId: chain.id,
        });
        expect(snapshotProposals).toBeDefined();
      });
    },
  );
});
