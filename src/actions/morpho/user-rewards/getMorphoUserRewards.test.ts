import { afterEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { MerklApiError } from "./common.js";
import {
  MorphoUserRewardsAggregateError,
  getMorphoUserRewards,
} from "./getMorphoUserRewards.js";

const ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678" as const;

function makeClient(chainIds: number[]): MoonwellClient {
  const environments = Object.fromEntries(
    chainIds.map((chainId) => [
      `chain-${chainId}`,
      {
        chainId,
        contracts: { morphoViews: {}, views: {} },
        custom: { morpho: { minimalDeployment: false } },
      },
    ]),
  );
  return { environments } as unknown as MoonwellClient;
}

function stubFetchByChain(
  responses: Record<number, () => Promise<unknown> | unknown>,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string) => {
      const url = new URL(input);
      const chainId = Number(url.searchParams.get("chainId"));
      const responder = responses[chainId];
      if (!responder) {
        return Promise.reject(new Error(`unexpected chainId ${chainId}`));
      }
      return Promise.resolve(responder());
    }),
  );
}

describe("getMorphoUserRewards", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("with throwOnExternalApiError true and 500 response, rejects with chain context", async () => {
    stubFetchByChain({
      8453: () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    });

    const client = makeClient([8453]);

    let caught: unknown;
    try {
      await getMorphoUserRewards(client, {
        userAddress: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MorphoUserRewardsAggregateError);
    const aggregate = caught as MorphoUserRewardsAggregateError;
    expect(aggregate.message).toContain("8453");
    expect(aggregate.errors).toHaveLength(1);
    expect(aggregate.rewards).toEqual([]);
    const inner = aggregate.errors[0] as MerklApiError;
    expect(inner).toBeInstanceOf(MerklApiError);
    expect(inner.chainId).toBe(8453);
    expect(inner.status).toBe(500);
    expect(inner.statusText).toBe("Internal Server Error");
    expect(inner.message).toMatch(
      /Merkl API request failed for chain 8453: 500/,
    );
  });

  test("without throwOnExternalApiError, resolves to [] on 500", async () => {
    stubFetchByChain({
      8453: () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    });

    const client = makeClient([8453]);

    const result = await getMorphoUserRewards(client, {
      userAddress: ACCOUNT,
    });

    expect(result).toEqual([]);
  });

  test("preserves successful chains when one fails and flag is unset", async () => {
    stubFetchByChain({
      8453: () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
      10: () => ({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              chain: { id: 10, name: "Optimism", icon: "" },
              rewards: [
                {
                  root: "0x",
                  recipient: ACCOUNT,
                  amount: "1000",
                  claimed: "200",
                  pending: "50",
                  proofs: [],
                  token: {
                    address: "0xA88594D404727625A9437C3f886C7643872296AE",
                    chainId: 10,
                    symbol: "WELL",
                    decimals: 18,
                    price: 0.004,
                  },
                  breakdowns: [],
                },
              ],
            },
          ]),
      }),
    });

    const client = {
      environments: {
        base: {
          chainId: 8453,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: false } },
        },
        optimism: {
          chainId: 10,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: true } },
        },
      },
    } as unknown as MoonwellClient;

    const result = await getMorphoUserRewards(client, {
      userAddress: ACCOUNT,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.chainId).toBe(10);
  });

  test("with throwOnExternalApiError, throws AggregateError listing failed chains and preserves errors", async () => {
    const baseError = new Error("base went down");
    stubFetchByChain({
      8453: () => Promise.reject(baseError),
      10: () => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      }),
    });

    const client = {
      environments: {
        base: {
          chainId: 8453,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: false } },
        },
        optimism: {
          chainId: 10,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: true } },
        },
      },
    } as unknown as MoonwellClient;

    let caught: unknown;
    try {
      await getMorphoUserRewards(client, {
        userAddress: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MorphoUserRewardsAggregateError);
    const aggregate = caught as MorphoUserRewardsAggregateError;
    expect(aggregate.message).toContain("8453");
    expect(aggregate.errors).toHaveLength(1);
    const inner = aggregate.errors[0] as MerklApiError;
    expect(inner).toBeInstanceOf(MerklApiError);
    expect(inner.chainId).toBe(8453);
    expect(inner.cause).toBe(baseError);
  });

  test("with throwOnExternalApiError and a successful chain, attaches partial rewards to AggregateError", async () => {
    stubFetchByChain({
      8453: () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
      10: () => ({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              chain: { id: 10, name: "Optimism", icon: "" },
              rewards: [
                {
                  root: "0x",
                  recipient: ACCOUNT,
                  amount: "1000",
                  claimed: "200",
                  pending: "50",
                  proofs: [],
                  token: {
                    address: "0xA88594D404727625A9437C3f886C7643872296AE",
                    chainId: 10,
                    symbol: "WELL",
                    decimals: 18,
                    price: 0.004,
                  },
                  breakdowns: [],
                },
              ],
            },
          ]),
      }),
    });

    const client = {
      environments: {
        base: {
          chainId: 8453,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: false } },
        },
        optimism: {
          chainId: 10,
          contracts: { morphoViews: {}, views: {} },
          custom: { morpho: { minimalDeployment: true } },
        },
      },
    } as unknown as MoonwellClient;

    let caught: unknown;
    try {
      await getMorphoUserRewards(client, {
        userAddress: ACCOUNT,
        throwOnExternalApiError: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MorphoUserRewardsAggregateError);
    const aggregate = caught as MorphoUserRewardsAggregateError;
    expect(aggregate.errors).toHaveLength(1);
    expect(aggregate.rewards).toHaveLength(1);
    expect(aggregate.rewards[0]?.chainId).toBe(10);
  });
});
