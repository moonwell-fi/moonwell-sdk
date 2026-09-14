import { describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import { getUserPositions } from "./getUserPositions.js";

const USER = "0xD90AF108299c5F14418a69D074D0717b612BC016";

type ViewsReads = {
  getAllMarketsInfo?: ReturnType<typeof vi.fn>;
  getUserBalances?: ReturnType<typeof vi.fn>;
  getUserBorrowsBalances?: ReturnType<typeof vi.fn>;
  getUserMarketsMemberships?: ReturnType<typeof vi.fn>;
};

const makeEnv = (
  chainId: number,
  reads: ViewsReads = {},
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const onError = vi.fn();
  const env = {
    chainId,
    onError,
    contracts: {
      views: {
        read: {
          getAllMarketsInfo: reads.getAllMarketsInfo ?? vi.fn(async () => []),
          getUserBalances: reads.getUserBalances ?? vi.fn(async () => []),
          getUserBorrowsBalances:
            reads.getUserBorrowsBalances ?? vi.fn(async () => []),
          getUserMarketsMemberships:
            reads.getUserMarketsMemberships ?? vi.fn(async () => []),
        },
      },
    },
    config: { markets: {}, tokens: {} },
  } as unknown as Environment;
  return { env, onError };
};

const rejectWith = (error: Error): ReturnType<typeof vi.fn> =>
  vi.fn(async () => {
    throw error;
  });

describe("getUserPositions failure surfacing", () => {
  test("a failed user-balances read on one chain rejects and reports that chain via onError", async () => {
    const rpcError = new Error("HTTP request failed: 429 Too Many Requests");
    const failing = makeEnv(8453, { getUserBalances: rejectWith(rpcError) });
    const healthy = makeEnv(10);
    const client = {
      environments: { base: failing.env, optimism: healthy.env },
    } as unknown as MoonwellClient;

    await expect(getUserPositions(client, { userAddress: USER })).rejects.toBe(
      rpcError,
    );

    expect(failing.onError).toHaveBeenCalledTimes(1);
    expect(failing.onError).toHaveBeenCalledWith(rpcError, {
      source: "getUserPositions",
      chainId: 8453,
    });
    expect(healthy.onError).not.toHaveBeenCalled();
  });

  test("failed borrows or memberships reads also reject instead of reading as zero", async () => {
    const borrowsError = new Error("borrows revert");
    const membershipsError = new Error("memberships revert");

    const borrows = makeEnv(8453, {
      getUserBorrowsBalances: rejectWith(borrowsError),
    });
    await expect(
      getUserPositions(
        { environments: { base: borrows.env } } as unknown as MoonwellClient,
        { userAddress: USER },
      ),
    ).rejects.toBe(borrowsError);

    const memberships = makeEnv(8453, {
      getUserMarketsMemberships: rejectWith(membershipsError),
    });
    await expect(
      getUserPositions(
        {
          environments: { base: memberships.env },
        } as unknown as MoonwellClient,
        { userAddress: USER },
      ),
    ).rejects.toBe(membershipsError);
  });

  test("every chain failing rejects with an AggregateError and reports each chain", async () => {
    const a = makeEnv(8453, {
      getUserBalances: rejectWith(new Error("base down")),
    });
    const b = makeEnv(10, {
      getUserBalances: rejectWith(new Error("optimism down")),
    });
    const client = {
      environments: { base: a.env, optimism: b.env },
    } as unknown as MoonwellClient;

    await expect(
      getUserPositions(client, { userAddress: USER }),
    ).rejects.toBeInstanceOf(AggregateError);

    expect(a.onError.mock.calls[0]?.[1]).toEqual({
      source: "getUserPositions",
      chainId: 8453,
    });
    expect(b.onError.mock.calls[0]?.[1]).toEqual({
      source: "getUserPositions",
      chainId: 10,
    });
  });

  test("an account with no positions resolves to [] without an error", async () => {
    const a = makeEnv(8453);
    const b = makeEnv(10);
    const client = {
      environments: { base: a.env, optimism: b.env },
    } as unknown as MoonwellClient;

    await expect(
      getUserPositions(client, { userAddress: USER }),
    ).resolves.toEqual([]);
    expect(a.onError).not.toHaveBeenCalled();
    expect(b.onError).not.toHaveBeenCalled();
  });

  test("a failed getAllMarketsInfo read still uses the mToken fallback, not an error", async () => {
    const oracleEnv = makeEnv(1, {
      getAllMarketsInfo: rejectWith(new Error("oracle reverted")),
    });
    const client = {
      environments: { ethereum: oracleEnv.env },
    } as unknown as MoonwellClient;

    await expect(
      getUserPositions(client, { userAddress: USER }),
    ).resolves.toEqual([]);
    expect(oracleEnv.onError).not.toHaveBeenCalled();
  });
});
