import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing markets", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get markets on ${chain.name}`, async () => {
        const marketData = await testClient.getMarkets<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(marketData).toBeDefined();
      });

      test(`Get markets by chain id on ${chain.name}`, async () => {
        const marketData = await testClient.getMarkets({
          chainId: chain.id,
        });
        expect(marketData).toBeDefined();
      });
    },
  );
});
