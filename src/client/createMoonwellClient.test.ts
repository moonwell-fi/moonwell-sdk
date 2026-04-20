import { describe, expect, test, vi } from "vitest";
import { createMoonwellClient } from "./createMoonwellClient.js";

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
