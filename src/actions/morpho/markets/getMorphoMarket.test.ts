import { optimism } from "viem/chains";
import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing Morpho Subgraph", () => {
  test("Get morpho market", async () => {
    const vaults = await testClient.getMorphoVaults({
      chainId: 10,
      includeRewards: true,
    });
    console.log(vaults);
    const morphoMarket = await testClient.getMarketSnapshots({
      chainId: optimism.id,
      marketId:
        "0xc7ae57c1998c67a4c21804df606db1309b68a518ba5acc8b1dc3ffcb1b26b071",
      type: "isolated",
    });

    expect(morphoMarket).toBeDefined();
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
