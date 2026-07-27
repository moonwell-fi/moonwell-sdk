import axios from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import { getUserPositionSnapshots } from "./getUserPositionSnapshots.js";

// ---------------------------------------------------------------------------
// No lunarIndexerUrl unit tests
// ---------------------------------------------------------------------------

describe("getUserPositionSnapshots — no lunarIndexerUrl (moonriver)", () => {
  const MOONRIVER_CHAIN_ID = 1285;
  const USER_ADDRESS =
    "0xD90AF108299c5F14418a69D074D0717b612BC016" as `0x${string}`;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns [] without making any HTTP call", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const getSpy = vi.spyOn(axios, "get");
    const onErrorSpy = vi.fn();
    const noUrlClient = {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          onError: onErrorSpy,
        } as unknown as Environment,
      },
    } as unknown as MoonwellClient;

    const result = await getUserPositionSnapshots(noUrlClient, {
      chainId: MOONRIVER_CHAIN_ID,
      userAddress: USER_ADDRESS,
    });

    expect(result).toEqual([]);
    expect(postSpy).not.toHaveBeenCalled();
    expect(getSpy).not.toHaveBeenCalled();
    // Guards against the empty result coming from the Lunar catch path
    // instead of the intentional missing-lunarIndexerUrl branch.
    expect(onErrorSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

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
