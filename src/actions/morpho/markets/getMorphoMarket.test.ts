import { optimism } from "viem/chains";
import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing Morpho Subgraph", () => {
  test("Get morpho market", async () => {
    const morphoMarket = await testClient.getMarketSnapshots({
      chainId: optimism.id,
      marketId:
        "0x173b66359f0741b1c7f1963075cd271c739b6dc73b658e108a54ce6febeb279b",
      type: "isolated",
    });

    expect(morphoMarket).toBeDefined();

    //BASE
    /*
    {
      chainId: 8453,
      timestamp: 1741964400000,
      marketId: '0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda',
      totalBorrows: 2738715.066881,
      totalBorrowsUsd: 2738434.1294894395,
      totalSupply: 1715.2201419433072,
      totalSupplyUsd: 3251443.8701034687,
      totalLiquidity: 270.6258127981439,
      totalLiquidityUsd: 513009.7406140291,
      baseSupplyApy: 0.050968256004740406,
      baseBorrowApy: 0.06080130043285137,
      loanTokenPrice: 0.99988998,
      collateralTokenPrice: 1895.62820385
    }
    */

    //OPTIMISM
    /*
    {
      chainId: 10,
      timestamp: 1741964987000,
      marketId: '0x173b66359f0741b1c7f1963075cd271c739b6dc73b658e108a54ce6febeb279b',
      totalBorrows: 0.992177,
      totalBorrowsUsd: 1919.4777160694562,
      totalSupply: 1.103291,
      totalSupplyUsd: 1.10312550635,
      totalLiquidity: 0.11111400000000005,
      totalLiquidityUsd: 0.11109733290000005,
      baseSupplyApy: 0,
      baseBorrowApy: 0,
      loanTokenPrice: 0.99985,
        collateralTokenPrice: 1934.61218721,
    }
    */
  });

  // Object.entries(testClient.environments).forEach(
  //   ([networkKey, environment]) => {
  //     const { chain, config } = environment;

  //     test.each(Object.keys(config.morphoMarkets))(
  //       `Get morpho market on ${chain.name}: %s`,
  //       async (marketKey) => {
  //         const morphoMarket = await testClient.getMorphoMarket<typeof chain>({
  //           network: networkKey as keyof typeof testClient.environments,
  //           market: marketKey as keyof MorphoMarketsType<
  //             GetEnvironment<typeof chain>
  //           >,
  //         });
  //         expect(morphoMarket).toBeDefined();
  //       },
  //     );
  //     test.each(Object.entries(config.morphoMarkets))(
  //       `Get morpho market by chain id on ${chain.name}: %s`,
  //       async (_, market) => {
  //         const morphoMarket = await testClient.getMorphoMarket({
  //           chainId: chain.id,
  //           marketId: market.id,
  //         });
  //         expect(morphoMarket).toBeDefined();
  //       },
  //     );

  //     if (Object.keys(config.morphoMarkets).length > 0) {
  //       test(`Get morpho market with rewards on ${chain.name}`, async () => {
  //         const morphoMarket = await testClient.getMorphoMarket<typeof chain>({
  //           network: networkKey as keyof typeof testClient.environments,
  //           market: Object.keys(
  //             config.morphoMarkets,
  //           )[0] as keyof MorphoMarketsType<GetEnvironment<typeof chain>>,
  //           includeRewards: true,
  //         });
  //         expect(morphoMarket).toBeDefined();
  //         expect(morphoMarket?.rewards).toBeDefined();
  //       });
  //       test(`Get morpho market with rewards on ${chain.name}`, async () => {
  //         const morphoMarket = await testClient.getMorphoMarket({
  //           chainId: chain.id,
  //           marketId: Object.values(config.morphoMarkets)[0].id,
  //           includeRewards: true,
  //         });
  //         expect(morphoMarket).toBeDefined();
  //         expect(morphoMarket?.rewards).toBeDefined();
  //       });
  //     }
  //   },
  // );
});
