import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing morpho markets", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get morpho markets on ${chain.name}`, async () => {
        const morphoMarkets = await testClient.getMorphoMarkets<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
        });
        expect(morphoMarkets).toBeDefined();
      });
      test(`Get morpho market by chain id on ${chain.name}`, async () => {
        const morphoMarkets = await testClient.getMorphoMarkets({
          chainId: chain.id,
        });
        expect(morphoMarkets).toBeDefined();
      });

      test(`Get morpho market with rewards on ${chain.name}`, async () => {
        const morphoMarkets = await testClient.getMorphoMarkets<typeof chain>({
          network: networkKey as keyof typeof testClient.environments,
          includeRewards: true,
        });
        expect(morphoMarkets).toBeDefined();
      });
      test(`Get morpho market with rewards on ${chain.name}`, async () => {
        const morphoMarkets = await testClient.getMorphoMarkets({
          chainId: chain.id,
          includeRewards: true,
        });
        expect(morphoMarkets).toBeDefined();
      });
    },
  );
});
