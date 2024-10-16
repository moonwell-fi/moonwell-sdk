import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing user balances", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user balances on ${chain.name}`, async () => {
        const userBalancesData = await testClient.getUserBalances<typeof chain>(
          {
            network: networkKey as keyof typeof testClient.environments,
            userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          },
        );
        expect(userBalancesData).toBeDefined();
      });

      test(`Get user balances by chain id on ${chain.name}`, async () => {
        const userBalancesData = await testClient.getUserBalances({
          chainId: chain.id,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
        });
        expect(userBalancesData).toBeDefined();
      });
    },
  );
});
