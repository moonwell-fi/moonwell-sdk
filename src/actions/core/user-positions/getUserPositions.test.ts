import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing user positions", async () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user positions on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositions<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
        });
        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions by chain id on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositions({
          chainId: chain.id,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
        });
        expect(userPositionData).toBeDefined();
      });
    },
  );
});
