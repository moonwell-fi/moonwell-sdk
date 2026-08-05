import { describe, expect, test, vi } from "vitest";
import { createMoonwellClient } from "./createMoonwellClient.js";

describe("network key resolution", () => {
  // The key ternary used to end in a bare `: polygon` fallthrough, so a key
  // TypeScript would have rejected silently produced a *Polygon* environment
  // filed under that key — Polygon contract addresses read over the caller's
  // RPC, with no error naming the cause. JS consumers and `as any` call sites
  // reach this; the sunset (MOO-551) made `moonbeam`/`moonriver` the keys most
  // likely to arrive here.
  test.each(["moonbeam", "moonriver"])(
    "throws for the removed %s network key instead of building a Polygon env",
    (network) => {
      expect(() =>
        createMoonwellClient({
          networks: { [network]: { rpcUrls: [] } } as never,
        }),
      ).toThrow(`Unsupported network "${network}"`);
    },
  );

  test("throws for an unrecognised network key", () => {
    expect(() =>
      createMoonwellClient({
        networks: { sepolia: { rpcUrls: [] } } as never,
      }),
    ).toThrow(/Unsupported network "sepolia"/);
  });

  test("every supported key still builds its own environment", () => {
    const client = createMoonwellClient({
      networks: {
        base: { rpcUrls: [] },
        optimism: { rpcUrls: [] },
        ethereum: { rpcUrls: [] },
        avalanche: { rpcUrls: [] },
        arbitrum: { rpcUrls: [] },
        polygon: { rpcUrls: [] },
      },
    });

    expect(client.environments.base.chainId).toBe(8453);
    expect(client.environments.optimism.chainId).toBe(10);
    expect(client.environments.ethereum.chainId).toBe(1);
    expect(client.environments.avalanche.chainId).toBe(43114);
    expect(client.environments.arbitrum.chainId).toBe(42161);
    expect(client.environments.polygon.chainId).toBe(137);
  });
});

describe("onError wiring", () => {
  test("sets onError on every created environment", () => {
    const onError = vi.fn();
    const client = createMoonwellClient({
      networks: {
        base: { rpcUrls: [] },
        optimism: { rpcUrls: [] },
      },
      onError,
    });

    expect(client.environments.base.onError).toBe(onError);
    expect(client.environments.optimism.onError).toBe(onError);
  });

  test("onError is undefined on environments when not provided", () => {
    const client = createMoonwellClient({
      networks: { base: { rpcUrls: [] } },
    });

    expect(client.environments.base.onError).toBeUndefined();
  });

  test("each environment receives the same onError reference", () => {
    const onError = vi.fn();
    const client = createMoonwellClient({
      networks: {
        base: { rpcUrls: [] },
        ethereum: { rpcUrls: [] },
        arbitrum: { rpcUrls: [] },
      },
      onError,
    });

    const callbacks = Object.values(client.environments).map(
      (env) => env.onError,
    );
    expect(callbacks.every((cb) => cb === onError)).toBe(true);
  });
});
