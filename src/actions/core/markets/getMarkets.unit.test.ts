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
  vi.unstubAllGlobals();
  vi.resetAllMocks();
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
