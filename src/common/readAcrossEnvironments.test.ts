import { describe, expect, test, vi } from "vitest";
import type { Environment } from "../environments/index.js";
import { ChainReadError } from "./error.js";
import { readAcrossEnvironments } from "./readAcrossEnvironments.js";

const makeEnv = (
  chainId: number,
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const onError = vi.fn();
  const env = { chainId, onError } as unknown as Environment;
  return { env, onError };
};

const rejectionOf = async (
  promise: Promise<unknown>,
): Promise<ChainReadError> =>
  (await promise.then(
    () => {
      throw new Error("expected the promise to reject");
    },
    (error) => error,
  )) as ChainReadError;

describe("readAcrossEnvironments", () => {
  test("a failing chain rejects with a ChainReadError carrying the original error and the healthy chains' data", async () => {
    const failing = makeEnv(8453);
    const healthy = makeEnv(10);
    const rpcError = new Error("HTTP request failed: 429 Too Many Requests");

    const error = await rejectionOf(
      readAcrossEnvironments({
        environments: [failing.env, healthy.env],
        source: "test-source",
        read: async (environment) => {
          if (environment.chainId === 8453) throw rpcError;
          return [{ chainId: environment.chainId }];
        },
      }),
    );

    expect(error).toBeInstanceOf(ChainReadError);
    expect(error).toBeInstanceOf(AggregateError);
    expect(error.name).toBe("ChainReadError");
    expect(error.source).toBe("test-source");
    expect(error.failures).toHaveLength(1);
    expect(error.failures[0]?.chainId).toBe(8453);
    expect(error.failures[0]?.reason).toBe(rpcError);
    expect(error.errors).toEqual([rpcError]);
    expect(error.data).toEqual([{ chainId: 10 }]);
    expect(error.message).toContain("test-source");
    expect(error.message).toContain("8453");
  });

  test("failures are surfaced only through the rejection, not through onError", async () => {
    const failing = makeEnv(8453);
    const healthy = makeEnv(10);

    await expect(
      readAcrossEnvironments({
        environments: [failing.env, healthy.env],
        source: "test-source",
        read: async (environment) => {
          if (environment.chainId === 8453) throw new Error("base down");
          return [];
        },
      }),
    ).rejects.toBeInstanceOf(ChainReadError);

    expect(failing.onError).not.toHaveBeenCalled();
    expect(healthy.onError).not.toHaveBeenCalled();
  });

  test("all chains failing lists every chain in environment order and carries no data", async () => {
    const a = makeEnv(8453);
    const b = makeEnv(10);
    const errorA = new Error("base down");
    const errorB = new Error("optimism down");

    const error = await rejectionOf(
      readAcrossEnvironments({
        environments: [a.env, b.env],
        source: "test-source",
        read: async (environment) => {
          throw environment.chainId === 8453 ? errorA : errorB;
        },
      }),
    );

    expect(error.failures.map((failure) => failure.chainId)).toEqual([
      8453, 10,
    ]);
    expect(error.errors).toEqual([errorA, errorB]);
    expect(error.data).toEqual([]);
    expect(error.message).toContain("8453");
    expect(error.message).toContain("10");
  });

  test("healthy chains return their results flattened in environment order", async () => {
    const a = makeEnv(8453);
    const b = makeEnv(10);

    const result = await readAcrossEnvironments({
      environments: [a.env, b.env],
      source: "test-source",
      read: async (environment) => [
        { chainId: environment.chainId, id: 1 },
        { chainId: environment.chainId, id: 2 },
      ],
    });

    expect(result).toEqual([
      { chainId: 8453, id: 1 },
      { chainId: 8453, id: 2 },
      { chainId: 10, id: 1 },
      { chainId: 10, id: 2 },
    ]);
  });

  test("an account with no positions on any chain returns [] without an error", async () => {
    const a = makeEnv(8453);
    const b = makeEnv(10);

    const result = await readAcrossEnvironments({
      environments: [a.env, b.env],
      source: "test-source",
      read: async () => [],
    });

    expect(result).toEqual([]);
  });
});
