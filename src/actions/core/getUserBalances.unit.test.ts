import { zeroAddress } from "viem";
import { describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import type { Environment } from "../../environments/index.js";
import { getUserBalances } from "./getUserBalances.js";

// MOO-832: a failed balance read used to resolve to `{ amount: 0n }`, so an RPC
// failure surfaced to consumers as a "successful" zero balance. The Moonwell
// frontend gates repay-all on the wallet balance, so one transient RPC hiccup
// during a refetch read as "wallet is empty" and disabled the confirm button for
// 59 users (Sentry MOONWELL-FRONTEND-195). A read that fails must be reported as
// unknown — omitted from the result and routed to onError — never as zero.

const CHAIN_ID = 8453;
const USER = "0x00000000000000000000000000000000000000aa" as const;
const USDC = "0x00000000000000000000000000000000000000c1" as const;
const WELL = "0x00000000000000000000000000000000000000c2" as const;
const STK_WELL = "0x00000000000000000000000000000000000000d1" as const;

type Reads = {
  balanceOf?: (token: `0x${string}`) => Promise<bigint>;
  getBalance?: () => Promise<bigint>;
  views?: { getTokensBalances: () => Promise<unknown> };
  vaults?: boolean;
};

const makeClient = (reads: Reads) => {
  const onError = vi.fn();
  const readContract = vi.fn(async ({ address }: { address: `0x${string}` }) =>
    (reads.balanceOf ?? (async () => 1n))(address),
  );
  const getBalance = vi.fn(async () =>
    (reads.getBalance ?? (async () => 1n))(),
  );
  const environment = {
    chainId: CHAIN_ID,
    onError,
    publicClient: { readContract, getBalance },
    contracts: reads.views ? { views: { read: reads.views } } : {},
    config: {
      tokens: {
        ETH: {
          address: zeroAddress,
          decimals: 18,
          symbol: "ETH",
          name: "Ether",
        },
        USDC: { address: USDC, decimals: 6, symbol: "USDC", name: "USD Coin" },
        WELL: { address: WELL, decimals: 18, symbol: "WELL", name: "WELL" },
      },
      vaults: reads.vaults
        ? { mwWELL: { vaultToken: "WELL", multiReward: STK_WELL } }
        : undefined,
    },
  } as unknown as Environment;
  const client = {
    environments: { base: environment },
  } as unknown as MoonwellClient;
  return { client, onError, readContract, getBalance };
};

const balancesByToken = (
  result: Awaited<ReturnType<typeof getUserBalances>>,
): Record<string, bigint> =>
  Object.fromEntries(
    result.map((b) => [b.token.address, b.tokenBalance.exponential]),
  );

describe("getUserBalances — failed reads are unknown, not zero (MOO-832)", () => {
  test("omits a token whose balanceOf read fails instead of reporting it as zero", async () => {
    const failure = new Error("HTTP request failed: 503");
    const { client, onError } = makeClient({
      balanceOf: async (token) => {
        if (token === WELL) throw failure;
        return 100n;
      },
    });

    const result = await getUserBalances(client, {
      chainId: CHAIN_ID,
      userAddress: USER,
    });

    const balances = balancesByToken(result);
    expect(balances[USDC]).toBe(100n);
    expect(balances[zeroAddress]).toBe(1n);
    // Not 0n — absent. A consumer that finds no entry knows the read is unknown.
    expect(WELL in balances).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({
        source: "user-balances-token-read",
        chainId: CHAIN_ID,
        token: WELL,
      }),
    );
  });

  test("omits the native token when getBalance fails", async () => {
    const { client, onError } = makeClient({
      getBalance: async () => {
        throw new Error("timeout");
      },
    });

    const result = await getUserBalances(client, {
      chainId: CHAIN_ID,
      userAddress: USER,
    });

    const balances = balancesByToken(result);
    expect(zeroAddress in balances).toBe(false);
    expect(balances[USDC]).toBe(1n);
    expect(balances[WELL]).toBe(1n);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        source: "user-balances-token-read",
        token: zeroAddress,
      }),
    );
  });

  // The fix must not start dropping real zeros: an empty wallet is a legitimate,
  // known balance and consumers rely on the entry being present.
  test("still reports a genuine zero balance as an entry", async () => {
    const { client, onError } = makeClient({
      balanceOf: async () => 0n,
      getBalance: async () => 0n,
    });

    const result = await getUserBalances(client, {
      chainId: CHAIN_ID,
      userAddress: USER,
    });

    expect(balancesByToken(result)).toEqual({
      [zeroAddress]: 0n,
      [USDC]: 0n,
      [WELL]: 0n,
    });
    expect(onError).not.toHaveBeenCalled();
  });

  test("falls back from a failing views multicall to per-token reads and still omits the ones that fail", async () => {
    const { client, onError } = makeClient({
      views: {
        getTokensBalances: async () => {
          throw new Error("execution reverted");
        },
      },
      balanceOf: async (token) => {
        if (token === USDC) throw new Error("rate limited");
        return 7n;
      },
    });

    const result = await getUserBalances(client, {
      chainId: CHAIN_ID,
      userAddress: USER,
    });

    const balances = balancesByToken(result);
    expect(balances[WELL]).toBe(7n);
    expect(USDC in balances).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ source: "user-balances-views-fallback" }),
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        source: "user-balances-token-read",
        token: USDC,
      }),
    );
  });

  test("omits a vault staking balance whose read fails", async () => {
    const { client } = makeClient({
      vaults: true,
      balanceOf: async (token) => {
        if (token === STK_WELL) throw new Error("boom");
        return 5n;
      },
    });

    const result = await getUserBalances(client, {
      chainId: CHAIN_ID,
      userAddress: USER,
    });

    const balances = balancesByToken(result);
    expect(STK_WELL in balances).toBe(false);
    expect(balances[WELL]).toBe(5n);
  });
});
