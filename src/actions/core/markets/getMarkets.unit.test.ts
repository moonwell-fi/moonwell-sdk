import { afterEach, expect, it, vi } from "vitest";
import { createMoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Market } from "../../../types/market.js";
vi.mock("./common.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./common.js")>();
  return { ...actual, getMarketsData: vi.fn() };
});
import { fetchLiquidStakingRewards, getMarketsData } from "./common.js";
const client = createMoonwellClient({
  networks: { base: { rpcUrls: ["https://rpc.invalid"] } },
});
function deferred<T>() {
  let resolve: (value: T) => void = () => {
    throw new Error("Promise not initialized");
  };
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
  vi.useRealTimers();
});

it("starts all staking providers alongside core data, preserving yield units and waiting for complete enrichment", async () => {
  const core = deferred<Market[]>();
  vi.mocked(getMarketsData).mockReturnValue(core.promise);
  const providers = [
    deferred<Response>(),
    deferred<Response>(),
    deferred<Response>(),
  ];
  const fetch = vi
    .fn()
    .mockImplementationOnce(() => providers[0]?.promise)
    .mockImplementationOnce(() => providers[1]?.promise)
    .mockImplementationOnce(() => providers[2]?.promise);
  vi.stubGlobal("fetch", fetch);
  let complete = false;
  const request = client
    .getMarkets({ chainId: 8453, includeLiquidStakingRewards: true })
    .then((data) => {
      complete = true;
      return data;
    });
  expect(getMarketsData).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(3);
  const markets = ["cbETH", "rETH", "wstETH"].map(
    (symbol) =>
      ({
        underlyingToken: { symbol },
        baseSupplyApy: 1,
        rewards: [],
        totalSupplyApr: 1,
      }) as unknown as Market,
  );
  core.resolve(markets);
  await Promise.resolve();
  expect(complete).toBe(false);
  for (const [index, body] of [
    { apy: "0.02" },
    { rethAPR: "3" },
    { data: { apr: 4 } },
  ].entries()) {
    providers[index]?.resolve({ ok: true, json: async () => body } as Response);
  }
  expect((await request).map((market) => market.totalSupplyApr)).toEqual([
    3, 4, 5,
  ]);
});

it("does not request staking providers when enrichment is disabled", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  vi.mocked(getMarketsData).mockResolvedValue([]);
  await client.getMarkets({
    chainId: 8453,
    includeLiquidStakingRewards: false,
  });
  expect(fetch).not.toHaveBeenCalled();
});

it("keeps healthy providers when one fails and applies a timeout to every request", async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error("Coinbase unavailable"))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ rethAPR: "3" }) })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { apr: 4 } }),
    });
  vi.stubGlobal("fetch", fetch);
  expect(await fetchLiquidStakingRewards()).toEqual({
    cbETH: 0,
    rETH: 3,
    wstETH: 4,
  });
  for (const call of fetch.mock.calls)
    expect(call[1].signal).toBeInstanceOf(AbortSignal);
});

it("keeps staking APRs available without the static AbortSignal.timeout browser API", async () => {
  vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
    throw new TypeError("AbortSignal.timeout is not a function");
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ apy: "0.02", rethAPR: "3", data: { apr: 4 } }),
    }),
  );
  expect(await fetchLiquidStakingRewards()).toEqual({
    cbETH: 2,
    rETH: 3,
    wstETH: 4,
  });
});

it("aborts stalled staking response bodies and clears every timeout", async () => {
  vi.useFakeTimers();
  const signals: AbortSignal[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, { signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return {
        ok: true,
        json: () =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () =>
              reject(new Error("aborted")),
            );
          }),
      };
    }),
  );
  const request = fetchLiquidStakingRewards();
  await vi.advanceTimersByTimeAsync(4_999);
  expect(signals.every((signal) => !signal.aborted)).toBe(true);
  await vi.advanceTimersByTimeAsync(1);
  expect(await request).toEqual({ cbETH: 0, rETH: 0, wstETH: 0 });
  expect(signals.every((signal) => signal.aborted)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("cleans up provider timers after success, HTTP failure and invalid JSON", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ apy: "0.02" }) })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Invalid JSON");
        },
      }),
  );
  expect(await fetchLiquidStakingRewards()).toEqual({
    cbETH: 2,
    rETH: 0,
    wstETH: 0,
  });
  expect(vi.getTimerCount()).toBe(0);
});

it("preserves healthy chains and non-staking rewards when another chain fails", async () => {
  const multiChain = createMoonwellClient({
    networks: {
      base: { rpcUrls: ["https://rpc.invalid"] },
      optimism: { rpcUrls: ["https://rpc.invalid"] },
    },
  });
  const rewards = [{ supplyApr: 2, liquidStakingApr: 0, borrowApr: -1 }];
  vi.mocked(getMarketsData)
    .mockRejectedValueOnce(new Error("Base unavailable"))
    .mockResolvedValueOnce([
      {
        chainId: 10,
        underlyingToken: { symbol: "USDC" },
        baseSupplyApy: 3,
        rewards,
        totalSupplyApr: 5,
      } as Market,
    ]);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unavailable")));
  const markets = await multiChain.getMarkets({
    includeLiquidStakingRewards: true,
  });
  expect(markets).toHaveLength(1);
  expect(markets[0]).toMatchObject({ chainId: 10, totalSupplyApr: 5, rewards });
});
