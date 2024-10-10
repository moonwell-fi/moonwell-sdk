import { describe, expect, test } from "vitest";
import { baseClient } from "../../../../test/client.js";

Object.entries(baseClient.environments).forEach(([networkKey, environment]) => {
  const { chain } = environment;

  describe(`Testing markets on ${chain.name}`, async () => {
    test("Get markets", async () => {
      const marketData = await baseClient.getMarkets<typeof chain>({
        network: networkKey as keyof typeof baseClient.environments,
      });
      expect(marketData).toBeDefined();
    });

    test("Get markets by chain id", async () => {
      const marketData = await baseClient.getMarkets({
        chainId: chain.id,
      });
      expect(marketData).toBeDefined();
    });

    // test('Get markets with invalid chain id', async () => {
    //   const marketData = await baseClient.getMarkets({
    //     chainId: 999999999,
    //   });
    //   expect(marketData).toBeUndefined();
    // });
  });
});
