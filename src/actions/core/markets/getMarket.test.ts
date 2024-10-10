import type { GetEnvironment, MarketsType } from "src/environments/index.js";
import type { Market } from "src/types/market.js";
import { describe, expect, test } from "vitest";
import { baseClient } from "../../../../test/client.js";

const verifyMarketProperties = (market: Market | undefined) => {
  expect(market).toBeDefined();
  expect(market).toHaveProperty("chainId");
  expect(market).toHaveProperty("marketToken");
  expect(market).toHaveProperty("underlyingToken");
  expect(market).toHaveProperty("totalSupply");
  expect(market).toHaveProperty("totalBorrows");
  expect(market).toHaveProperty("totalReserves");
};

Object.entries(baseClient.environments).forEach(([networkKey, environment]) => {
  const { chain, markets, tokens } = environment;

  describe(`Testing markets on ${chain.name}`, () => {
    test.each(Object.keys(markets))("Get market: %s", async (marketKey) => {
      const marketData = await baseClient.getMarket<typeof chain>({
        market: marketKey as keyof MarketsType<GetEnvironment<typeof chain>>,
        network: networkKey as keyof typeof baseClient.environments,
      });
      expect(marketData).toBeDefined();
      verifyMarketProperties(marketData);
    });

    test.each(Object.entries(markets))(
      "Get market by address: %s",
      async (_, market) => {
        const marketData = await baseClient.getMarket({
          chainId: chain.id,
          marketAddress: market.address,
        });
        expect(marketData).toBeDefined();
        verifyMarketProperties(marketData);
      },
    );

    test("Get market with invalid market address", async () => {
      const marketData = await baseClient.getMarket({
        chainId: chain.id,
        marketAddress: "0x0invalidAddress",
      });
      expect(marketData).toBeUndefined();
    });

    test("Get market with invalid chain id", async () => {
      const marketData = await baseClient.getMarket({
        chainId: 999999999,
        marketAddress: tokens.MOONWELL_ETH.address,
      });
      expect(marketData).toBeUndefined();
    });

    // test('Get market with null arg', async () => {
    //   const marketData = await baseClient.getMarket(undefined as any);
    //   expect(marketData).toBeUndefined();
    // });
  });
});
