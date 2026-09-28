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
});
