import type { GetEnvironment, MarketsType } from "src/environments/index.js";
import type { Market } from "src/types/market.js";
import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

const verifyMarketProperties = (market: Market | undefined) => {
  expect(market).toBeDefined();
  expect(market).toHaveProperty("chainId");
  expect(market).toHaveProperty("marketToken");
  expect(market).toHaveProperty("underlyingToken");
  expect(market).toHaveProperty("totalSupply");
  expect(market).toHaveProperty("totalBorrows");
  expect(market).toHaveProperty("totalReserves");
};

describe("Testing markets", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, markets, tokens } = environment;

      test.each(Object.keys(markets))(
        `Get market on ${chain.name}: %s`,
        async (marketKey) => {
          const marketData = await testClient.getMarket<typeof chain>({
            market: marketKey as keyof MarketsType<
              GetEnvironment<typeof chain>
            >,
            network: networkKey as keyof typeof testClient.environments,
          });
          expect(marketData).toBeDefined();
          verifyMarketProperties(marketData);
        },
      );

      test.each(Object.entries(markets))(
        `Get market by address on ${chain.name}: %s`,
        async (_, market) => {
          const marketData = await testClient.getMarket({
            chainId: chain.id,
            marketAddress: market.address,
          });
          expect(marketData).toBeDefined();
          verifyMarketProperties(marketData);
        },
      );

      test(`Get market with invalid market address on ${chain.name}`, async () => {
        const marketData = await testClient.getMarket({
          chainId: chain.id,
          marketAddress: "0x0invalidAddress",
        });
        expect(marketData).toBeUndefined();
      });

      test(`Get market with invalid chain id on ${chain.name}`, async () => {
        const marketData = await testClient.getMarket({
          chainId: 999999999,
          marketAddress: Object.values(tokens)[0].address,
        });
        expect(marketData).toBeUndefined();
      });

      // test('Get market with null arg', async () => {
      //   const marketData = await baseClient.getMarket(undefined as any);
      //   expect(marketData).toBeUndefined();
      // });
    },
  );
});
