import type { GetEnvironment, MarketsType } from "src/environments/index.js";
import { describe, expect, test } from "vitest";
import { baseClient } from "../../../../test/client.js";

Object.entries(baseClient.environments).forEach(([networkKey, environment]) => {
  const { chain, markets, tokens } = environment;

  describe(`Testing markets on ${chain.name}`, () => {
    test.each(Object.keys(markets))("Get market: %s", async (marketKey) => {
      const market = await baseClient.getMarket<typeof chain>({
        market: marketKey as keyof MarketsType<GetEnvironment<typeof chain>>,
        network: networkKey as keyof typeof baseClient.environments,
      });
      expect(market).toBeDefined();
      expect(market).toHaveProperty("chainId");
      expect(market).toHaveProperty("marketToken");
      expect(market).toHaveProperty("underlyingToken");
      expect(market).toHaveProperty("totalSupply");
      expect(market).toHaveProperty("totalBorrows");
      expect(market).toHaveProperty("totalReserves");
    });

    test.each(Object.entries(markets))(
      "Get market by address: %s",
      async (_, market) => {
        const moonwellMarket = await baseClient.getMarket({
          chainId: chain.id,
          marketAddress: market.address,
        });
        expect(moonwellMarket).toBeDefined();
        expect(moonwellMarket).toHaveProperty("chainId");
        expect(moonwellMarket).toHaveProperty("marketToken");
        expect(moonwellMarket).toHaveProperty("underlyingToken");
        expect(moonwellMarket).toHaveProperty("totalSupply");
        expect(moonwellMarket).toHaveProperty("totalBorrows");
        expect(moonwellMarket).toHaveProperty("totalReserves");
      },
    );

    test("Get market with invalid market address", async () => {
      const market = await baseClient.getMarket({
        chainId: chain.id,
        marketAddress: "0x0invalidAddress",
      });
      expect(market).toBeUndefined();
    });

    test("Get market with invalid chain id", async () => {
      const market = await baseClient.getMarket({
        chainId: 999999999,
        marketAddress: tokens.MOONWELL_ETH.address,
      });
      expect(market).toBeUndefined();
    });

    // test('Get market with null arg', async () => {
    //   const market = await baseClient.getMarket(undefined as any);
    //   expect(market).toBeUndefined();
    // });
  });
});
