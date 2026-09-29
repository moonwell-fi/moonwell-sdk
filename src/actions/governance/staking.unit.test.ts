import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { getStakingInfo } from "./getStakingInfo.js";
import { getUserStakingInfo } from "./getUserStakingInfo.js";

// Merkl reads hit the network; they are irrelevant to these paths.
vi.mock("./common.js", () => ({
  getMerklStakingApr: vi.fn().mockResolvedValue(0),
  getMerklCampaignIds: vi.fn().mockResolvedValue([]),
  getMerklRewardsData: vi.fn().mockResolvedValue([]),
}));

const USER = "0x00000000000000000000000000000000000000aa" as const;

const VALID_STAKING_INFO = {
  cooldown: 1n,
  distributionEnd: 1n,
  emissionPerSecond: 1n,
  totalSupply: 1n,
  unstakeWindow: 1n,
};

type Reads = Record<string, ReturnType<typeof vi.fn>>;

const makeStkWell = (overrides: Reads = {}): Reads => ({
  COOLDOWN_SECONDS: vi.fn().mockResolvedValue(10n),
  UNSTAKE_WINDOW: vi.fn().mockResolvedValue(20n),
  DISTRIBUTION_END: vi.fn().mockResolvedValue(30n),
  totalSupply: vi.fn().mockResolvedValue(40n),
  assets: vi.fn().mockResolvedValue([5n, 0n, 0n]),
  stakersCooldowns: vi.fn().mockResolvedValue(0n),
  getTotalRewardsBalance: vi.fn().mockResolvedValue(3n),
  balanceOf: vi.fn().mockResolvedValue(4n),
  ...overrides,
});

// Every WELL chain prices WELL from the Base oracle (`base` below, which has no
// views and so stays out of the staking env list).
const makeClient = (
  options: {
    views?: Reads;
    stakingToken?: Reads | undefined;
    price?: "fails" | "succeeds";
  } = {},
) => {
  const onError = vi.fn();
  const getUnderlyingPrice =
    options.price === "succeeds"
      ? vi.fn().mockResolvedValue(0n)
      : vi.fn().mockRejectedValue(new Error("multicall failed"));

  const baseEnv = {
    chainId: 8453,
    onError,
    custom: { governance: { token: "WELL" } },
    config: {
      tokens: {
        MOONWELL_WELL: {
          address: "0x00000000000000000000000000000000000000b1",
        },
      },
      contracts: {},
    },
    contracts: { oracle: { read: { getUnderlyingPrice } } },
  };

  const stakingToken =
    "stakingToken" in options ? options.stakingToken : makeStkWell();

  const makeStakingEnv = (chainId: number) => ({
    chainId,
    onError,
    custom: { governance: { token: "WELL" } },
    config: {
      tokens: {
        WELL: {
          address: "0x00000000000000000000000000000000000000c1",
          decimals: 18,
          name: "WELL",
          symbol: "WELL",
        },
        stkWELL: {
          address: "0x00000000000000000000000000000000000000c2",
          decimals: 18,
          name: "stkWELL",
          symbol: "stkWELL",
        },
      },
      contracts: { governanceToken: "WELL", stakingToken: "stkWELL" },
    },
    contracts: {
      views: {
        read: options.views ?? {
          getStakingInfo: vi.fn().mockResolvedValue(VALID_STAKING_INFO),
          getUserStakingInfo: vi.fn().mockResolvedValue({
            cooldown: 0n,
            pendingRewards: 0n,
            totalStaked: 0n,
          }),
        },
      },
      governanceToken: { read: { balanceOf: vi.fn().mockResolvedValue(0n) } },
      ...(stakingToken && { stakingToken: { read: stakingToken } }),
    },
  });

  const client = {
    environments: {
      base: baseEnv,
      optimism: makeStakingEnv(10),
      ethereum: makeStakingEnv(1),
    },
  } as unknown as MoonwellClient;

  return { client, onError, getUnderlyingPrice };
};

const reportsFrom = (onError: ReturnType<typeof vi.fn>, source: string) =>
  onError.mock.calls.filter(
    ([, context]) => (context as { source: string }).source === source,
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // Step past the previous test's shared price read.
  vi.setSystemTime(Date.now() + 60_000);
});

afterAll(() => {
  vi.useRealTimers();
});

// A failed Base oracle read used to be reported once per staking chain and per
// action; it is now one shared read with one report.
describe("staking actions share one governance token price read", () => {
  test("getStakingInfo reports a failed price once for all staking chains", async () => {
    const { client, onError, getUnderlyingPrice } = makeClient();

    const result = await getStakingInfo(client);

    expect(result.map((r) => r.tokenPrice)).toEqual([0, 0]);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(1);
    expect(reportsFrom(onError, "governance-token-price")).toEqual([
      [
        expect.any(Error),
        {
          source: "governance-token-price",
          chainId: 8453,
          operation: "governance-token-price-read",
          items: ["10", "1"],
        },
      ],
    ]);
  });

  test("getUserStakingInfo reports a failed price once for all staking chains", async () => {
    const { client, onError, getUnderlyingPrice } = makeClient();

    const result = await getUserStakingInfo(client, { userAddress: USER });

    expect(result.map((r) => r.tokenPrice)).toEqual([0, 0]);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(1);
    expect(reportsFrom(onError, "governance-token-price")).toHaveLength(1);
  });

  test("concurrent staking reads share the price read and report once", async () => {
    const { client, onError, getUnderlyingPrice } = makeClient();

    await Promise.all([
      getStakingInfo(client),
      getUserStakingInfo(client, { userAddress: USER }),
    ]);

    expect(getUnderlyingPrice).toHaveBeenCalledTimes(1);
    expect(reportsFrom(onError, "governance-token-price")).toHaveLength(1);
  });
});

describe("getStakingInfo stkWELL fallback", () => {
  test("reads from stkWELL when the views call rejects", async () => {
    const { client, onError } = makeClient({
      price: "succeeds",
      views: { getStakingInfo: vi.fn().mockRejectedValue(new Error("revert")) },
    });

    const result = await getStakingInfo(client);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      cooldown: 10,
      unstakeWindow: 20,
      distributionEnd: 30,
    });
    expect(result[0]?.totalSupply.exponential).toBe(40n);
    expect(onError).not.toHaveBeenCalled();
  });

  test("reads from stkWELL when the views struct is fully zeroed", async () => {
    const { client } = makeClient({
      price: "succeeds",
      views: {
        getStakingInfo: vi.fn().mockResolvedValue({
          ...VALID_STAKING_INFO,
          cooldown: 0n,
          unstakeWindow: 0n,
          totalSupply: 0n,
          emissionPerSecond: 0n,
        }),
      },
    });

    const result = await getStakingInfo(client);

    expect(result[0]?.cooldown).toBe(10);
  });

  test("reports each failed stkWELL read and zeroes only that field", async () => {
    const { client, onError } = makeClient({
      price: "succeeds",
      views: { getStakingInfo: vi.fn().mockRejectedValue(new Error("revert")) },
      stakingToken: makeStkWell({
        DISTRIBUTION_END: vi.fn().mockRejectedValue(new Error("rpc")),
      }),
    });

    const result = await getStakingInfo(client);

    expect(result[0]).toMatchObject({ cooldown: 10, distributionEnd: 0 });
    expect(reportsFrom(onError, "staking-fallback")).toHaveLength(2);
  });

  test("omits the chain when the stkWELL totalSupply read fails", async () => {
    const { client } = makeClient({
      price: "succeeds",
      views: { getStakingInfo: vi.fn().mockRejectedValue(new Error("revert")) },
      stakingToken: makeStkWell({
        totalSupply: vi.fn().mockRejectedValue(new Error("rpc")),
      }),
    });

    expect(await getStakingInfo(client)).toEqual([]);
  });

  test("reports and omits the chain when stkWELL is not configured", async () => {
    const { client, onError } = makeClient({
      price: "succeeds",
      views: { getStakingInfo: vi.fn().mockRejectedValue(new Error("revert")) },
      stakingToken: undefined,
    });

    expect(await getStakingInfo(client)).toEqual([]);
    expect(reportsFrom(onError, "staking-fallback")).toHaveLength(2);
  });
});

describe("getUserStakingInfo stkWELL fallback", () => {
  const rejectingViews = () => ({
    getUserStakingInfo: vi.fn().mockRejectedValue(new Error("revert")),
    getStakingInfo: vi.fn().mockRejectedValue(new Error("revert")),
  });

  test("reads the user position and schedule from stkWELL", async () => {
    const { client, onError } = makeClient({
      price: "succeeds",
      views: rejectingViews(),
    });

    const result = await getUserStakingInfo(client, { userAddress: USER });

    expect(result).toHaveLength(2);
    expect(result[0]?.pendingRewards.exponential).toBe(3n);
    expect(result[0]?.stakingTokenBalance.exponential).toBe(4n);
    expect(result[0]?.cooldownActive).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });

  test("reports each failed stkWELL read and zeroes only that field", async () => {
    const { client, onError } = makeClient({
      price: "succeeds",
      views: rejectingViews(),
      stakingToken: makeStkWell({
        balanceOf: vi.fn().mockRejectedValue(new Error("rpc")),
        UNSTAKE_WINDOW: vi.fn().mockRejectedValue(new Error("rpc")),
      }),
    });

    const result = await getUserStakingInfo(client, { userAddress: USER });

    expect(result[0]?.stakingTokenBalance.exponential).toBe(0n);
    expect(reportsFrom(onError, "user-staking-fallback")).toHaveLength(2);
    expect(reportsFrom(onError, "user-staking-schedule-fallback")).toHaveLength(
      2,
    );
  });

  test("omits the chain when every stkWELL read fails", async () => {
    const rejecting = vi.fn().mockRejectedValue(new Error("rpc"));
    const { client } = makeClient({
      price: "succeeds",
      views: rejectingViews(),
      stakingToken: makeStkWell({
        stakersCooldowns: rejecting,
        getTotalRewardsBalance: rejecting,
        balanceOf: rejecting,
        COOLDOWN_SECONDS: rejecting,
        UNSTAKE_WINDOW: rejecting,
      }),
    });

    expect(await getUserStakingInfo(client, { userAddress: USER })).toEqual([]);
  });

  test("omits the chain when stkWELL is not configured", async () => {
    const { client } = makeClient({
      price: "succeeds",
      views: rejectingViews(),
      stakingToken: undefined,
    });

    expect(await getUserStakingInfo(client, { userAddress: USER })).toEqual([]);
  });
});
