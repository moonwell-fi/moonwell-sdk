import { describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { ChainReadError } from "../../../common/error.js";
import type { Environment } from "../../../environments/index.js";
import { getUserPosition } from "./getUserPosition.js";
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
  test("a failed user-balances read on one chain rejects with a ChainReadError naming that chain", async () => {
    const rpcError = new Error("HTTP request failed: 429 Too Many Requests");
    const failing = makeEnv(8453, { getUserBalances: rejectWith(rpcError) });
    const healthy = makeEnv(10);
    const client = {
      environments: { base: failing.env, optimism: healthy.env },
    } as unknown as MoonwellClient;

    const promise = getUserPositions(client, { userAddress: USER });

    await expect(promise).rejects.toBeInstanceOf(ChainReadError);
    await expect(promise).rejects.toMatchObject({
      source: "getUserPositions",
      failures: [{ chainId: 8453, reason: rpcError }],
      data: [],
    });

    // Surfaced through the rejection only, not additionally through onError.
    expect(failing.onError).not.toHaveBeenCalled();
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
    ).rejects.toMatchObject({
      failures: [{ chainId: 8453, reason: borrowsError }],
    });

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
    ).rejects.toMatchObject({
      failures: [{ chainId: 8453, reason: membershipsError }],
    });
  });

  test("every chain failing rejects with a ChainReadError listing each chain", async () => {
    const baseError = new Error("base down");
    const optimismError = new Error("optimism down");
    const a = makeEnv(8453, { getUserBalances: rejectWith(baseError) });
    const b = makeEnv(10, { getUserBalances: rejectWith(optimismError) });
    const client = {
      environments: { base: a.env, optimism: b.env },
    } as unknown as MoonwellClient;

    await expect(
      getUserPositions(client, { userAddress: USER }),
    ).rejects.toMatchObject({
      failures: [
        { chainId: 8453, reason: baseError },
        { chainId: 10, reason: optimismError },
      ],
      data: [],
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

  test("a failed getAllMarketsInfo read uses the mToken fallback and reports the degraded read via onError", async () => {
    const oracleError = new Error("oracle reverted");
    const oracleEnv = makeEnv(1, {
      getAllMarketsInfo: rejectWith(oracleError),
    });
    const client = {
      environments: { ethereum: oracleEnv.env },
    } as unknown as MoonwellClient;

    await expect(
      getUserPositions(client, { userAddress: USER }),
    ).resolves.toEqual([]);
    expect(oracleEnv.onError).toHaveBeenCalledTimes(1);
    expect(oracleEnv.onError).toHaveBeenCalledWith(oracleError, {
      source: "user-positions-oracle-fallback",
      chainId: 1,
    });
  });
});

/**
 * Realistic single-chain fixture: two markets with real token metadata plus
 * one market whose tokens are missing from config and one that is configured
 * but has no deployed mToken contract, so both readers' guard branches run.
 */
const USDC = "0x0000000000000000000000000000000000000001";
const M_USDC = "0x0000000000000000000000000000000000000002";
const WETH = "0x0000000000000000000000000000000000000003";
const M_WETH = "0x0000000000000000000000000000000000000004";
const CBBTC = "0x0000000000000000000000000000000000000005";
const M_CBBTC = "0x0000000000000000000000000000000000000006";
const UNKNOWN_MARKET = "0x00000000000000000000000000000000000000ee";

const marketInfo = (
  market: string,
  underlyingDecimals: number,
  priceUsd: number,
  collateralFactor: number,
  exchangeRate: number,
) => ({
  market,
  underlyingPrice: BigInt(priceUsd) * 10n ** BigInt(36 - underlyingDecimals),
  collateralFactor: BigInt(Math.round(collateralFactor * 100)) * 10n ** 16n,
  exchangeRate: BigInt(exchangeRate) * 10n ** BigInt(10 + underlyingDecimals),
});

const makeMarketEnv = (
  reads: ViewsReads,
  options: {
    exchangeRateStored?: Record<string, ReturnType<typeof vi.fn>>;
  } = {},
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const base = makeEnv(8453, reads);
  const rates = options.exchangeRateStored ?? {};
  const env = {
    ...base.env,
    markets: {
      USDC: {
        address: M_USDC,
        read: {
          exchangeRateStored: rates.USDC ?? vi.fn(async () => 2n * 10n ** 16n),
        },
      },
      WETH: {
        address: M_WETH,
        read: {
          exchangeRateStored:
            rates.WETH ??
            vi.fn(async () => {
              throw new Error("mToken read failed");
            }),
        },
      },
      // CBBTC is configured but has no deployed mToken contract here.
    },
    config: {
      markets: {
        USDC: { marketToken: "mUSDC", underlyingToken: "USDC" },
        WETH: { marketToken: "mWETH", underlyingToken: "WETH" },
        CBBTC: { marketToken: "mCBBTC", underlyingToken: "CBBTC" },
        // Tokens for DAI are missing from config on purpose.
        DAI: { marketToken: "mDAI", underlyingToken: "DAI" },
      },
      tokens: {
        USDC: { address: USDC, decimals: 6, symbol: "USDC", name: "USD Coin" },
        mUSDC: {
          address: M_USDC,
          decimals: 8,
          symbol: "mUSDC",
          name: "Moonwell USDC",
        },
        WETH: { address: WETH, decimals: 18, symbol: "WETH", name: "WETH" },
        mWETH: {
          address: M_WETH,
          decimals: 8,
          symbol: "mWETH",
          name: "Moonwell WETH",
        },
        CBBTC: { address: CBBTC, decimals: 8, symbol: "cbBTC", name: "cbBTC" },
        mCBBTC: {
          address: M_CBBTC,
          decimals: 8,
          symbol: "mcbBTC",
          name: "Moonwell cbBTC",
        },
      },
    },
  } as unknown as Environment;
  return { env, onError: base.onError };
};

describe("getUserPositions position computation", () => {
  const reads = (): ViewsReads => ({
    getAllMarketsInfo: vi.fn(async () => [
      marketInfo(M_USDC, 6, 1, 0.8, 2),
      marketInfo(M_WETH, 18, 2000, 0.75, 1),
      marketInfo(UNKNOWN_MARKET, 18, 1, 0.5, 1),
    ]),
    // 100 mUSDC at an exchange rate of 2 = 200 USDC supplied.
    getUserBalances: vi.fn(async () => [
      { token: M_USDC, amount: 100n * 10n ** 8n },
    ]),
    // 1 WETH borrowed.
    getUserBorrowsBalances: vi.fn(async () => [
      { token: M_WETH, amount: 10n ** 18n },
    ]),
    getUserMarketsMemberships: vi.fn(async () => [
      { token: M_USDC, membership: true },
      { token: M_WETH, membership: false },
    ]),
  });

  test("prices positions from getAllMarketsInfo and drops markets not in the environment", async () => {
    const { env, onError } = makeMarketEnv(reads());
    const client = {
      environments: { base: env },
    } as unknown as MoonwellClient;

    const positions = await getUserPositions(client, { userAddress: USER });

    expect(positions.map((position) => position.market.symbol)).toEqual([
      "mUSDC",
      "mWETH",
    ]);

    const [usdc, weth] = positions;
    expect(usdc?.collateralEnabled).toBe(true);
    expect(usdc?.supplied.value).toBeCloseTo(200);
    expect(usdc?.suppliedUsd).toBeCloseTo(200);
    expect(usdc?.collateral.value).toBeCloseTo(160);
    expect(usdc?.collateralUsd).toBeCloseTo(160);
    expect(usdc?.borrowed.exponential).toBe(0n);

    expect(weth?.collateralEnabled).toBe(false);
    expect(weth?.borrowed.value).toBeCloseTo(1);
    expect(weth?.borrowedUsd).toBeCloseTo(2000);
    expect(weth?.supplied.exponential).toBe(0n);
    expect(weth?.collateral.exponential).toBe(0n);
    expect(onError).not.toHaveBeenCalled();
  });

  test("getUserPosition narrows to one market by address or by market key", async () => {
    const { env } = makeMarketEnv(reads());
    const client = {
      environments: { base: env },
    } as unknown as MoonwellClient;

    const byAddress = await getUserPosition(client, {
      chainId: 8453,
      marketAddress: M_WETH,
      userAddress: USER,
    });
    expect(byAddress?.market.symbol).toBe("mWETH");

    const byKey = await getUserPosition(client, {
      chainId: 8453,
      market: "USDC",
      userAddress: USER,
    } as unknown as Parameters<typeof getUserPosition>[1]);
    expect(byKey?.market.symbol).toBe("mUSDC");

    await expect(
      getUserPosition(client, {
        chainId: 8453,
        marketAddress: UNKNOWN_MARKET,
        userAddress: USER,
      }),
    ).resolves.toBeUndefined();

    await expect(
      getUserPosition(client, {
        chainId: 999,
        marketAddress: M_USDC,
        userAddress: USER,
      }),
    ).resolves.toBeUndefined();
  });

  test("the mToken fallback computes positions without USD values when the oracle read fails", async () => {
    const oracleError = new Error("oracle reverted");
    const { env, onError } = makeMarketEnv({
      ...reads(),
      getAllMarketsInfo: rejectWith(oracleError),
      getUserBalances: vi.fn(async () => [
        { token: M_USDC, amount: 100n * 10n ** 8n },
        // Configured market without a deployed mToken contract: default rate.
        { token: M_CBBTC, amount: 5n * 10n ** 8n },
      ]),
    });
    const client = {
      environments: { base: env },
    } as unknown as MoonwellClient;

    const positions = await getUserPositions(client, { userAddress: USER });

    expect(onError).toHaveBeenCalledWith(oracleError, {
      source: "user-positions-oracle-fallback",
      chainId: 8453,
    });
    expect(positions.map((position) => position.market.symbol)).toEqual([
      "mUSDC",
      "mWETH",
      "mcbBTC",
    ]);

    const [usdc, weth, cbbtc] = positions;
    // exchangeRateStored resolved: 100 mUSDC * 2 = 200 USDC.
    expect(usdc?.supplied.value).toBeCloseTo(200);
    expect(usdc?.collateralEnabled).toBe(true);
    expect(usdc?.suppliedUsd).toBe(0);
    expect(usdc?.collateralUsd).toBe(0);
    expect(usdc?.collateral.exponential).toBe(0n);
    // exchangeRateStored threw: falls back to a 1:1 default rate.
    expect(weth?.borrowed.value).toBeCloseTo(1);
    expect(weth?.collateralEnabled).toBe(false);
    expect(weth?.borrowedUsd).toBe(0);
    // No mToken contract at all: also the default rate.
    expect(cbbtc?.supplied.value).toBeCloseTo(5);
  });

  test("getUserPosition through the mToken fallback still narrows to the requested market", async () => {
    const { env } = makeMarketEnv({
      ...reads(),
      getAllMarketsInfo: rejectWith(new Error("oracle reverted")),
    });
    const client = {
      environments: { base: env },
    } as unknown as MoonwellClient;

    const position = await getUserPosition(client, {
      chainId: 8453,
      marketAddress: M_WETH,
      userAddress: USER,
    });

    expect(position?.market.symbol).toBe("mWETH");
    expect(position?.borrowed.value).toBeCloseTo(1);
  });
});
