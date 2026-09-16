import { describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { ChainReadError } from "../../../common/error.js";
import type { Environment } from "../../../environments/index.js";
import { getMorphoMarketUserPosition } from "./getMorphoMarketUserPosition.js";
import { getMorphoMarketUserPositions } from "./getMorphoMarketUserPositions.js";

const USER = "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8";
const MARKET_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const ZERO_POSITION = {
  collateralAssets: 0n,
  loanAssets: 0n,
  loanShares: 0n,
};

const makeEnv = (
  chainId: number,
  read: ReturnType<typeof vi.fn>,
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const onError = vi.fn();
  const env = {
    chainId,
    onError,
    contracts: {
      views: {},
      morphoViews: { read: { getMorphoBlueUserBalances: read } },
    },
    config: {
      tokens: {
        USDC: { symbol: "USDC", decimals: 6 },
        cbBTC: { symbol: "cbBTC", decimals: 8 },
      },
      morphoMarkets: {
        cbBTC_USDC: {
          id: MARKET_ID,
          loanToken: "USDC",
          collateralToken: "cbBTC",
        },
      },
    },
  } as unknown as Environment;
  return { env, onError };
};

/** Ethereum-like: has a views contract but no Morpho deployment. */
const makeEnvWithoutMorpho = (
  chainId: number,
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const onError = vi.fn();
  const env = {
    chainId,
    onError,
    contracts: { views: {} },
    config: { tokens: {}, morphoMarkets: {} },
  } as unknown as Environment;
  return { env, onError };
};

describe("getMorphoMarketUserPositions failure surfacing", () => {
  test("a failed read on one chain rejects with a ChainReadError carrying the healthy chain's positions", async () => {
    const rpcError = new Error("HTTP request failed: 429 Too Many Requests");
    const failing = makeEnv(
      8453,
      vi.fn(async () => {
        throw rpcError;
      }),
    );
    const healthy = makeEnv(
      10,
      vi.fn(async () => [ZERO_POSITION]),
    );
    const client = {
      environments: { base: failing.env, optimism: healthy.env },
    } as unknown as MoonwellClient;

    const promise = getMorphoMarketUserPositions(client, { userAddress: USER });

    await expect(promise).rejects.toBeInstanceOf(ChainReadError);
    await expect(promise).rejects.toMatchObject({
      source: "getMorphoMarketUserPositions",
      failures: [{ chainId: 8453, reason: rpcError }],
      data: [{ chainId: 10, marketId: MARKET_ID }],
    });

    // Surfaced through the rejection only, not additionally through onError.
    expect(failing.onError).not.toHaveBeenCalled();
    expect(healthy.onError).not.toHaveBeenCalled();
  });

  test("every chain failing rejects with a ChainReadError listing each chain", async () => {
    const baseError = new Error("base down");
    const optimismError = new Error("optimism down");
    const a = makeEnv(
      8453,
      vi.fn(async () => {
        throw baseError;
      }),
    );
    const b = makeEnv(
      10,
      vi.fn(async () => {
        throw optimismError;
      }),
    );
    const client = {
      environments: { base: a.env, optimism: b.env },
    } as unknown as MoonwellClient;

    await expect(
      getMorphoMarketUserPositions(client, { userAddress: USER }),
    ).rejects.toMatchObject({
      failures: [
        { chainId: 8453, reason: baseError },
        { chainId: 10, reason: optimismError },
      ],
      data: [],
    });
  });

  test("an account with no positions resolves with zeroed positions and no error", async () => {
    const healthy = makeEnv(
      8453,
      vi.fn(async () => [ZERO_POSITION]),
    );
    const client = {
      environments: { base: healthy.env },
    } as unknown as MoonwellClient;

    const result = await getMorphoMarketUserPositions(client, {
      userAddress: USER,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.marketId).toBe(MARKET_ID);
    expect(result[0]?.supplied.exponential).toBe(0n);
    expect(result[0]?.borrowed.exponential).toBe(0n);
    expect(healthy.onError).not.toHaveBeenCalled();
  });

  test("a chain without morphoViews is skipped, not treated as a failure", async () => {
    const healthy = makeEnv(
      8453,
      vi.fn(async () => [ZERO_POSITION]),
    );
    const noMorpho = makeEnvWithoutMorpho(1);
    const client = {
      environments: { base: healthy.env, ethereum: noMorpho.env },
    } as unknown as MoonwellClient;

    const result = await getMorphoMarketUserPositions(client, {
      userAddress: USER,
    });

    expect(result.map((position) => position.chainId)).toEqual([8453]);
    expect(noMorpho.onError).not.toHaveBeenCalled();
  });

  test("getMorphoMarketUserPosition rejects on a failed read instead of resolving undefined", async () => {
    const rpcError = new Error("timeout");
    const failing = makeEnv(
      8453,
      vi.fn(async () => {
        throw rpcError;
      }),
    );
    const client = {
      environments: { base: failing.env },
    } as unknown as MoonwellClient;

    await expect(
      getMorphoMarketUserPosition(client, {
        chainId: 8453,
        marketId: MARKET_ID,
        userAddress: USER,
      }),
    ).rejects.toBe(rpcError);
  });

  test("getMorphoMarketUserPosition on a chain without morphoViews resolves undefined, not a TypeError", async () => {
    const noMorpho = makeEnvWithoutMorpho(1);
    const client = {
      environments: { ethereum: noMorpho.env },
    } as unknown as MoonwellClient;

    await expect(
      getMorphoMarketUserPosition(client, {
        chainId: 1,
        marketId: MARKET_ID,
        userAddress: USER,
      }),
    ).resolves.toBeUndefined();
    expect(noMorpho.onError).not.toHaveBeenCalled();
  });
});
