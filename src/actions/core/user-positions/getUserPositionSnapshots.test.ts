import axios from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../../test/client.js";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import { getUserPositionSnapshots } from "./getUserPositionSnapshots.js";

// ---------------------------------------------------------------------------
// Ponder path unit tests
// ---------------------------------------------------------------------------

describe("getUserPositionSnapshots — Ponder path (indexerUrl, no lunarIndexerUrl)", () => {
  const MOCK_PONDER_URL = "https://mock-ponder.test";
  const MOONRIVER_CHAIN_ID = 1285;
  const USER_ADDRESS =
    "0xD90AF108299c5F14418a69D074D0717b612BC016" as `0x${string}`;

  function makeMoonriverClient(): MoonwellClient {
    return {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          indexerUrl: MOCK_PONDER_URL,
          config: { tokens: {} },
        } as unknown as Environment,
      },
    } as unknown as MoonwellClient;
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("calls axios.post with indexerUrl when no lunarIndexerUrl", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        data: {
          accountDailySnapshots: {
            items: [],
            pageInfo: { hasNextPage: false, endCursor: "" },
          },
        },
      },
    });

    await getUserPositionSnapshots(makeMoonriverClient(), {
      chainId: MOONRIVER_CHAIN_ID,
      userAddress: USER_ADDRESS,
    });

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.objectContaining({
        query: expect.stringContaining(USER_ADDRESS.toLowerCase()),
      }),
    );
  });

  test("returns mapped snapshot data from Ponder", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        data: {
          accountDailySnapshots: {
            items: [
              {
                timestamp: 1704067200, // 2024-01-01 00:00:00 UTC (start of day)
                totalBorrowsUSD: "500",
                totalSuppliesUSD: "2000",
                totalCollateralUSD: "1500",
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: "" },
          },
        },
      },
    });

    const result = await getUserPositionSnapshots(makeMoonriverClient(), {
      chainId: MOONRIVER_CHAIN_ID,
      userAddress: USER_ADDRESS,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.totalSupplyUsd).toBe(2000);
    expect(result[0]?.totalBorrowsUsd).toBe(500);
    expect(result[0]?.totalCollateralUsd).toBe(1500);
  });

  test("returns [] when both lunarIndexerUrl and indexerUrl are absent", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const noUrlClient = {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          indexerUrl: undefined,
        } as unknown as Environment,
      },
    } as unknown as MoonwellClient;

    const result = await getUserPositionSnapshots(noUrlClient, {
      chainId: MOONRIVER_CHAIN_ID,
      userAddress: USER_ADDRESS,
    });

    expect(result).toEqual([]);
    expect(postSpy).not.toHaveBeenCalled();
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
