import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../environments/index.js";
import {
  getGovernanceTokenPriceFor,
  getGovernanceTokenPriceOrZero,
} from "./getWellPrice.js";

const MOONWELL_WELL = "0x1111111111111111111111111111111111111111";

const makeBaseEnv = (getUnderlyingPrice: ReturnType<typeof vi.fn>) =>
  ({
    chainId: 8453,
    custom: { governance: { token: "WELL" } },
    config: { tokens: { MOONWELL_WELL: { address: MOONWELL_WELL } } },
    contracts: { oracle: { read: { getUnderlyingPrice } } },
  }) as unknown as Environment;

const makeWellEnv = (chainId: number, onError: ReturnType<typeof vi.fn>) =>
  ({
    chainId,
    custom: { governance: { token: "WELL" } },
    contracts: {},
    onError,
  }) as unknown as Environment;

describe("governance token price sharing", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    // Step past the previous test's cache entry.
    vi.setSystemTime(Date.now() + 60_000);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("concurrent calls for the same price source share one read", async () => {
    const getUnderlyingPrice = vi.fn().mockResolvedValue(5n);
    const base = makeBaseEnv(getUnderlyingPrice);
    const onError = vi.fn();

    const prices = await Promise.all(
      [10, 8453, 1].map((chainId) =>
        getGovernanceTokenPriceFor(makeWellEnv(chainId, onError), base),
      ),
    );

    expect(prices).toEqual([5n, 5n, 5n]);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(1);
  });

  test("a failed shared read is reported once and resolves to 0n", async () => {
    const getUnderlyingPrice = vi
      .fn()
      .mockRejectedValue(new Error("multicall failed"));
    const base = makeBaseEnv(getUnderlyingPrice);
    const onError = vi.fn();

    const prices = await Promise.all(
      [10, 8453, 1].map((chainId) =>
        getGovernanceTokenPriceOrZero(makeWellEnv(chainId, onError), base),
      ),
    );

    expect(prices).toEqual([0n, 0n, 0n]);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      source: "governance-token-price",
      chainId: 8453,
      operation: "governance-token-price-read",
      items: ["10", "8453", "1"],
    });
  });

  test("failures are not cached: the next call reads again", async () => {
    const getUnderlyingPrice = vi
      .fn()
      .mockRejectedValueOnce(new Error("multicall failed"))
      .mockResolvedValueOnce(7n);
    const base = makeBaseEnv(getUnderlyingPrice);
    const env = makeWellEnv(10, vi.fn());

    expect(await getGovernanceTokenPriceOrZero(env, base)).toBe(0n);
    expect(await getGovernanceTokenPriceOrZero(env, base)).toBe(7n);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(2);
  });

  test("a successful price is reused within the TTL and refreshed after it", async () => {
    const getUnderlyingPrice = vi
      .fn()
      .mockResolvedValueOnce(5n)
      .mockResolvedValueOnce(6n);
    const base = makeBaseEnv(getUnderlyingPrice);
    const env = makeWellEnv(10, vi.fn());

    expect(await getGovernanceTokenPriceFor(env, base)).toBe(5n);
    expect(await getGovernanceTokenPriceFor(env, base)).toBe(5n);
    vi.setSystemTime(Date.now() + 11_000);
    expect(await getGovernanceTokenPriceFor(env, base)).toBe(6n);
    expect(getUnderlyingPrice).toHaveBeenCalledTimes(2);
  });

  // Clients configure their own RPCs: a price source is shared only by the
  // consumers reading through that same source, never across sources that
  // happen to be on the same chain.
  test("different price sources on the same chain do not share a read", async () => {
    const readA = vi.fn().mockResolvedValue(5n);
    const readB = vi.fn().mockResolvedValue(9n);
    const baseA = makeBaseEnv(readA);
    const baseB = makeBaseEnv(readB);

    const prices = await Promise.all([
      getGovernanceTokenPriceFor(makeWellEnv(10, vi.fn()), baseA),
      getGovernanceTokenPriceFor(makeWellEnv(10, vi.fn()), baseB),
    ]);

    expect(prices).toEqual([5n, 9n]);
    expect(readA).toHaveBeenCalledTimes(1);
    expect(readB).toHaveBeenCalledTimes(1);
  });

  test("a failing source does not affect a healthy source on the same chain", async () => {
    const failing = makeBaseEnv(
      vi.fn().mockRejectedValue(new Error("multicall failed")),
    );
    const healthy = makeBaseEnv(vi.fn().mockResolvedValue(9n));
    const onErrorA = vi.fn();
    const onErrorB = vi.fn();

    const prices = await Promise.all([
      getGovernanceTokenPriceOrZero(makeWellEnv(10, onErrorA), failing),
      getGovernanceTokenPriceOrZero(makeWellEnv(10, onErrorB), healthy),
    ]);

    expect(prices).toEqual([0n, 9n]);
    expect(onErrorA).toHaveBeenCalledTimes(1);
    expect(onErrorB).not.toHaveBeenCalled();
  });

  test("still reports when the first consumer of a failed read has no onError", async () => {
    const base = makeBaseEnv(
      vi.fn().mockRejectedValue(new Error("multicall failed")),
    );
    const withoutCallback = {
      ...makeWellEnv(10, vi.fn()),
      onError: undefined,
    } as unknown as Environment;
    const onError = vi.fn();

    await Promise.all([
      getGovernanceTokenPriceOrZero(withoutCallback, base),
      getGovernanceTokenPriceOrZero(makeWellEnv(1, onError), base),
    ]);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  test("reports a failed read once to each distinct onError callback", async () => {
    const base = makeBaseEnv(
      vi.fn().mockRejectedValue(new Error("multicall failed")),
    );
    const onErrorA = vi.fn();
    const onErrorB = vi.fn();

    await Promise.all([
      getGovernanceTokenPriceOrZero(makeWellEnv(10, onErrorA), base),
      getGovernanceTokenPriceOrZero(makeWellEnv(1, onErrorA), base),
      getGovernanceTokenPriceOrZero(makeWellEnv(10, onErrorB), base),
    ]);

    expect(onErrorA).toHaveBeenCalledTimes(1);
    expect(onErrorB).toHaveBeenCalledTimes(1);
  });
});
