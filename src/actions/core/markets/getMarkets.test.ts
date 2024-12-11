import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import { moonbeam } from "../../../environments/index.js";

describe("Testing markets", () => {
  test("Test xcDOT market to have bad debt", async () => {
    const xcDOTMarket = await testClient.getMarket({
      chainId: moonbeam.id,
      marketAddress:
        testClient.environments.moonbeam.markets.MOONWELL_xcDOT.address,
    });
    expect(xcDOTMarket).toBeDefined();
  });

  // test("Test FRAX market to have debt", async () => {
  //   const fraxMarket = await testClient.getMarket({
  //     chainId: moonbeam.id,
  //     marketAddress: testClient.environments.moonbeam.markets.MOONWELL_FRAX.address,
  //   });
  //   expect(fraxMarket).toBeDefined();
  //   expect(fraxMarket?.badDebtUsd).toBeGreaterThan(0);
  // });

  // test("Test GLMR market to not have debt", async () => {
  //   const glmrMarket = await testClient.getMarket({
  //     chainId: moonbeam.id,
  //     marketAddress: testClient.environments.moonbeam.markets.MOONWELL_GLMR.address,
  //   });
  //   expect(glmrMarket).toBeDefined();
  //   expect(glmrMarket?.badDebtUsd).toBe(0);
  // });

  // Object.entries(testClient.environments).forEach(
  //   ([networkKey, environment]) => {
  //     const { chain } = environment;

  //     test(`Get markets on ${chain.name}`, async () => {
  //       const marketData = await testClient.getMarkets<typeof chain>({
  //         network: networkKey as keyof typeof testClient.environments,
  //       });
  //       expect(marketData).toBeDefined();
  //     });

  //     test(`Get markets by chain id on ${chain.name}`, async () => {
  //       const marketData = await testClient.getMarkets({
  //         chainId: chain.id,
  //       });
  //       expect(marketData).toBeDefined();
  //     });
  //   },
  // );
});
