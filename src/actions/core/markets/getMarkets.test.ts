import { describe, expect, test } from "vitest";
import { baseClient } from "../../../../test/client.js";

Object.entries(baseClient.environments).forEach(([networkKey, environment]) => {
  const { chain } = environment;

  describe(`Testing markets on ${chain.name}`, async () => {
    test("Get markets", async () => {
      const market = await baseClient.getMarkets<typeof chain>({
        network: networkKey as keyof typeof baseClient.environments,
      });
      expect(market).toBeDefined();
    });

    test("Get markets by chain id", async () => {
      const market = await baseClient.getMarkets({
        chainId: chain.id,
      });
      expect(market).toBeDefined();
    });

    // test('Get markets with invalid chain id', async () => {
    //   const moonwellMarket = await baseClient.getMarkets({
    //     chainId: 999999999,
    //   });
    //   expect(moonwellMarket).toBeUndefined();
    // });
  });
});
