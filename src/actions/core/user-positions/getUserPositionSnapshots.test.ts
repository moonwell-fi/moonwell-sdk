import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";

describe("Testing user positions snapshots", async () => {
  Object.entries(testClient.environments).forEach(
    ([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user positions on ${chain.name} (default behavior)`, async () => {
        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
        });

        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions with period "1M" on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          period: "1M",
        });

        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions with period "3M" on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          period: "3M",
        });

        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions with period "1Y" on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          period: "1Y",
        });

        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions with period "ALL" on ${chain.name}`, async () => {
        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          period: "ALL",
        });

        expect(userPositionData).toBeDefined();
      });

      test(`Get user positions with custom time range on ${chain.name}`, async () => {
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

        const userPositionData = await testClient.getUserPositionSnapshots<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0xD90AF108299c5F14418a69D074D0717b612BC016",
          startTime: thirtyDaysAgo,
          endTime: now,
        });

        expect(userPositionData).toBeDefined();
      });
    },
  );
});
