import type { GetEnvironment, MarketsType } from "src/environments/index.js";
import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing user reward", () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain, markets } = environment;
      test.each(Object.keys(markets))(
        `Get market user reward on ${chain.name}: %s`,
        async (marketKey) => {
          const userRewardData = await testClient.getUserReward<typeof chain>({
            network: networkKey as keyof typeof testClient.environments,
            market: marketKey as keyof MarketsType<
              GetEnvironment<typeof chain>
            >,
            userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          });
          expect(userRewardData).toBeDefined();
        },
      );

      test.each(Object.entries(markets))(
        `Get market user reward by market address on ${chain.name}: %s`,
        async (_, market) => {
          const userRewardData = await testClient.getUserReward({
            chainId: chain.id,
            marketAddress: market.address,
            userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          });
          expect(userRewardData).toBeDefined();
        },
      );
    },
  );
});
