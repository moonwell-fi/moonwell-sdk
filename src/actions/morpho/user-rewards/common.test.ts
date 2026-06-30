import { afterEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../../environments/index.js";
import type { MorphoUserReward } from "../../../types/morphoUserReward.js";
import { MerklApiError, getUserMorphoRewardsData } from "./common.js";

type MerklReward = Extract<MorphoUserReward, { type: "merkl-reward" }>;

const ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678" as const;

// A real Moonwell vault campaignId from base/morpho-vaults.ts. The vault
// campaign filtering in `getUserMorphoRewardsData` should keep this one.
const MOONWELL_VAULT_CAMPAIGN =
  "0x1df9a935f6b928b4809c4fda483f16839140864b2b412cc5fea85fd5d9d00e57";

// Not in any publicEnvironments vault config — should be filtered out on
// full-deployment chains.
const NON_MOONWELL_CAMPAIGN =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const WELL_TOKEN = {
  address: "0xA88594D404727625A9437C3f886C7643872296AE",
  chainId: 8453,
  symbol: "WELL",
  decimals: 18,
  price: 0.004,
};

const baseEnvironment = {
  chainId: 8453,
  custom: { morpho: { minimalDeployment: false } },
} as unknown as Environment;

const optimismEnvironment = {
  chainId: 10,
  custom: {},
} as unknown as Environment;

function makeMerklResponse(
  rewardOverrides: { amount: string; claimed: string; pending: string },
  breakdowns: {
    campaignId: string;
    amount: string;
    claimed: string;
    pending: string;
  }[],
) {
  return [
    {
      chain: { id: 8453, name: "Base", icon: "" },
      rewards: [
        {
          root: "0x",
          recipient: ACCOUNT,
          amount: rewardOverrides.amount,
          claimed: rewardOverrides.claimed,
          pending: rewardOverrides.pending,
          proofs: [],
          token: WELL_TOKEN,
          breakdowns: breakdowns.map((b) => ({ reason: "campaign", ...b })),
        },
      ],
    },
  ];
}

function mockFetchOnce(data: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
      }),
    ),
  );
}

describe("getUserMorphoRewardsData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("on full deployments, restricts to Moonwell vault campaigns", async () => {
    mockFetchOnce(
      makeMerklResponse(
        // Top-level totals across all campaigns.
        { amount: "1000", claimed: "200", pending: "50" },
        [
          // Counts.
          {
            campaignId: MOONWELL_VAULT_CAMPAIGN,
            amount: "600",
            claimed: "100",
            pending: "30",
          },
          // Excluded.
          {
            campaignId: NON_MOONWELL_CAMPAIGN,
            amount: "400",
            claimed: "100",
            pending: "20",
          },
        ],
      ),
    );

    const result = await getUserMorphoRewardsData({
      environment: baseEnvironment,
      account: ACCOUNT,
    });

    expect(result).toHaveLength(1);
    const reward = result[0] as MerklReward;
    expect(reward.type).toBe("merkl-reward");
    // Filtered amounts: 600 - 100 = 500 claimable now, 30 future.
    expect(reward.claimableNow.exponential).toBe(500n);
    expect(reward.claimableFuture.exponential).toBe(30n);
    expect(reward.rewardToken.symbol).toBe("WELL");
  });

  test("on minimal deployments, uses unfiltered top-level reward totals", async () => {
    mockFetchOnce(
      makeMerklResponse({ amount: "1000", claimed: "200", pending: "50" }, [
        {
          campaignId: NON_MOONWELL_CAMPAIGN,
          amount: "400",
          claimed: "100",
          pending: "20",
        },
      ]),
    );

    const result = await getUserMorphoRewardsData({
      environment: optimismEnvironment,
      account: ACCOUNT,
    });

    expect(result).toHaveLength(1);
    const reward = result[0] as MerklReward;
    // Top-level totals: 1000 - 200 = 800 claimable now, 50 future.
    expect(reward.claimableNow.exponential).toBe(800n);
    expect(reward.claimableFuture.exponential).toBe(50n);
  });

  test("returns empty array when Merkl returns no rewards", async () => {
    mockFetchOnce([]);

    const result = await getUserMorphoRewardsData({
      environment: baseEnvironment,
      account: ACCOUNT,
    });

    expect(result).toEqual([]);
  });

  test("returns empty array when Merkl request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        }),
      ),
    );

    const result = await getUserMorphoRewardsData({
      environment: baseEnvironment,
      account: ACCOUNT,
    });

    expect(result).toEqual([]);
  });

  test("returns empty array when fetch rejects and throwOnExternalApiError is not set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network unreachable"))),
    );

    const result = await getUserMorphoRewardsData({
      environment: baseEnvironment,
      account: ACCOUNT,
    });

    expect(result).toEqual([]);
  });

  test("with throwOnExternalApiError, propagates non-ok Merkl responses as MerklApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        }),
      ),
    );

    let caught: unknown;
    try {
      await getUserMorphoRewardsData({
        environment: baseEnvironment,
        account: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MerklApiError);
    const merklError = caught as MerklApiError;
    expect(merklError.status).toBe(500);
    expect(merklError.statusText).toBe("Internal Server Error");
    expect(merklError.chainId).toBe(8453);
    expect(merklError.url).toContain("/api/v1/merkl/");
    expect(merklError.message).toContain("chain 8453");
    expect(merklError.message).toContain("500");
  });

  test("with throwOnExternalApiError, wraps fetch rejections in MerklApiError", async () => {
    const networkError = new Error("network unreachable");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(networkError)),
    );

    let caught: unknown;
    try {
      await getUserMorphoRewardsData({
        environment: baseEnvironment,
        account: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MerklApiError);
    const merklError = caught as MerklApiError;
    expect(merklError.chainId).toBe(8453);
    expect(merklError.status).toBeUndefined();
    expect(merklError.statusText).toBeUndefined();
    expect(merklError.url).toContain("/api/v1/merkl/");
    expect(merklError.message).toContain("network error");
    expect(merklError.cause).toBe(networkError);
  });

  test("with throwOnExternalApiError, wraps response parse failures in MerklApiError", async () => {
    const parseError = new SyntaxError("unexpected token");
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(parseError),
        }),
      ),
    );

    let caught: unknown;
    try {
      await getUserMorphoRewardsData({
        environment: baseEnvironment,
        account: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MerklApiError);
    const merklError = caught as MerklApiError;
    expect(merklError.chainId).toBe(8453);
    expect(merklError.status).toBeUndefined();
    expect(merklError.message).toContain("parse error");
    expect(merklError.cause).toBe(parseError);
  });

  test("with throwOnExternalApiError, does not log on non-ok HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        }),
      ),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      getUserMorphoRewardsData({
        environment: baseEnvironment,
        account: ACCOUNT,
        throwOnExternalApiError: true,
      }),
    ).rejects.toBeInstanceOf(MerklApiError);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
  });

  test("with throwOnExternalApiError, does not log on fetch rejection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network unreachable"))),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      getUserMorphoRewardsData({
        environment: baseEnvironment,
        account: ACCOUNT,
        throwOnExternalApiError: true,
      }),
    ).rejects.toBeInstanceOf(MerklApiError);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
  });

  test("on full deployments, returns zero claimable when no breakdowns match Moonwell campaigns", async () => {
    mockFetchOnce(
      makeMerklResponse({ amount: "1000", claimed: "200", pending: "50" }, [
        {
          campaignId: NON_MOONWELL_CAMPAIGN,
          amount: "400",
          claimed: "100",
          pending: "20",
        },
      ]),
    );

    const result = await getUserMorphoRewardsData({
      environment: baseEnvironment,
      account: ACCOUNT,
    });

    expect(result).toHaveLength(1);
    const reward = result[0] as MerklReward;
    expect(reward.claimableNow.exponential).toBe(0n);
    expect(reward.claimableFuture.exponential).toBe(0n);
  });
});
