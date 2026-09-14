import { describe, expect, test, vi } from "vitest";
import type { Environment } from "../environments/index.js";
import { readAcrossEnvironments } from "./readAcrossEnvironments.js";

const makeEnv = (
  chainId: number,
): { env: Environment; onError: ReturnType<typeof vi.fn> } => {
  const onError = vi.fn();
  const env = { chainId, onError } as unknown as Environment;
  return { env, onError };
};

describe("readAcrossEnvironments", () => {
  test("a single failing chain rejects with the original error and reports only that chain", async () => {
    const failing = makeEnv(8453);
    const healthy = makeEnv(10);
    const rpcError = new Error("HTTP request failed: 429 Too Many Requests");

    await expect(
      readAcrossEnvironments({
        environments: [failing.env, healthy.env],
        source: "test-source",
        read: async (environment) => {
          if (environment.chainId === 8453) throw rpcError;
          return [{ chainId: environment.chainId }];
        },
      }),
    ).rejects.toBe(rpcError);

    expect(failing.onError).toHaveBeenCalledTimes(1);
    expect(failing.onError).toHaveBeenCalledWith(rpcError, {
      source: "test-source",
      chainId: 8453,
    });
    expect(healthy.onError).not.toHaveBeenCalled();
  });

  test("all chains failing rejects with an AggregateError naming every chain", async () => {
    const a = makeEnv(8453);
    const b = makeEnv(10);
    const errorA = new Error("base down");
    const errorB = new Error("optimism down");

    const promise = readAcrossEnvironments({
      environments: [a.env, b.env],
      source: "test-source",
      read: async (environment) => {
        throw environment.chainId === 8453 ? errorA : errorB;
      },
    });

    await expect(promise).rejects.toBeInstanceOf(AggregateError);
    await promise.catch((error: AggregateError) => {
      expect(error.errors).toEqual([errorA, errorB]);
      expect(error.message).toContain("test-source");
      expect(error.message).toContain("8453");
      expect(error.message).toContain("10");
    });

    expect(a.onError).toHaveBeenCalledWith(errorA, {
      source: "test-source",
      chainId: 8453,
    });
    expect(b.onError).toHaveBeenCalledWith(errorB, {
      source: "test-source",
      chainId: 10,
    });
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
    expect(a.onError).not.toHaveBeenCalled();
    expect(b.onError).not.toHaveBeenCalled();
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
    expect(a.onError).not.toHaveBeenCalled();
    expect(b.onError).not.toHaveBeenCalled();
  });

  test("a failure still rejects when the client has no onError configured", async () => {
    const env = { chainId: 8453 } as unknown as Environment;
    const rpcError = new Error("timeout");

    await expect(
      readAcrossEnvironments({
        environments: [env],
        source: "test-source",
        read: async () => {
          throw rpcError;
        },
      }),
    ).rejects.toBe(rpcError);
  });
});
