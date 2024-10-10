import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

Object.entries(testClient.environments).forEach(([networkKey, environment]) => {
  const { chain } = environment;

  describe(`Testing markets on ${chain.name}`, async () => {
    test("Get markets", async () => {
      const marketData = await testClient.getMarkets<typeof chain>({
        network: networkKey as keyof typeof testClient.environments,
      });
      expect(marketData).toBeDefined();
    });

    test("Get markets by chain id", async () => {
      const marketData = await testClient.getMarkets({
        chainId: chain.id,
      });
      expect(marketData).toBeDefined();
    });

    // test('Get markets with invalid chain id', async () => {
    //   const marketData = await testClient.getMarkets({
    //     chainId: 999999999,
    //   });
    //   expect(marketData).toBeUndefined();
    // });
  });
});
