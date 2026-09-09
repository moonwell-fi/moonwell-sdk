import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import { getMorphoMarketsData } from "./common.js";
import type { LunarIndexerMarket } from "./lunarIndexerTransform.js";

const client = createMoonwellClient({
  networks: { base: { rpcUrls: ["https://rpc.invalid"] } },
});
const id = "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba";
const row: LunarIndexerMarket = {
  marketId: id,
  chainId: 8453,
  totalSupplyAssets: "100",
  totalBorrowAssets: "40",
  totalLiquidity: "60",
  totalSupplyAssetsUsd: "200000",
  totalBorrowAssetsUsd: "80000",
  totalLiquidityUsd: "120000",
  totalCollateralAssets: "25",
  totalCollateralAssetsUsd: "60000",
  loanTokenPrice: "2000",
  collateralTokenPrice: "2400",
  supplyApy: "3",
  borrowApy: "5",
  lltv: "94.5",
  fee: "0.1",
  oracle: "0x0000000000000000000000000000000000000001",
  irm: "0x0000000000000000000000000000000000000002",
  loanToken: {
    address: "0x4200000000000000000000000000000000000006",
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
  },
  collateralToken: {
    address: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
    name: "Wrapped stETH",
    symbol: "wstETH",
    decimals: 18,
  },
  rewards: [
    {
      token: "0x0000000000000000000000000000000000000003",
      tokenName: "Reward",
      tokenSymbol: "RWD",
      tokenDecimals: 18,
      supplyApr: "2",
      borrowApr: "-1",
    },
  ],
};
const emptyLiquidity = { vaults: [], markets: {} };
function response(data: unknown) {
  return { data, status: 200, statusText: "OK", headers: {}, config: {} };
}
function deferred<T>() {
  let resolve: (value: T) => void = () => {
    throw new Error("Promise not initialized");
  };
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function api() {
  return vi
    .spyOn(axios, "get")
    .mockImplementation(async (url) =>
      response(
        url.includes("shared-liquidity") ? emptyLiquidity : { results: [row] },
      ),
    );
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("independent isolated-market loading", () => {
  it("returns base balances, collateral and reward APRs without any allocator request when opted out", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeRewards: true,
      includeSharedLiquidity: false,
    });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0]?.[0]).toContain(
      "/isolated/markets/8453?includeRewards=true",
    );
    expect(markets[0]).toMatchObject({
      sharedLiquidityStatus: "not-requested",
      publicAllocatorSharedLiquidity: [],
      totalSupplyApr: 5,
      totalBorrowApr: 4,
      availableLiquidityUsd: 120000,
      collateralAssetsUsd: 60000,
    });
    expect(markets[0]?.availableLiquidity.value).toBe(60);
    expect(markets[0]?.collateralAssets?.value).toBe(25);
  });

  it("supports the same opt-out on the single-market action", async () => {
    const get = api();
    const market = await client.getMorphoMarket({
      chainId: 8453,
      marketId: id,
      includeSharedLiquidity: false,
    });
    expect(market?.sharedLiquidityStatus).toBe("not-requested");
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("keeps the existing default enriched and distinguishes a successful zero result", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({ chainId: 8453 });
    expect(get).toHaveBeenCalledTimes(2);
    expect(markets[0]).toMatchObject({
      sharedLiquidityStatus: "available",
      publicAllocatorSharedLiquidity: [],
    });
  });

  it("lets a base request complete while an independent liquidity request is unresolved", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    const slow = deferred<ReturnType<typeof response>>();
    get.mockImplementation(async (url) =>
      url.includes("shared-liquidity")
        ? slow.promise
        : response({ results: [{ ...row, totalLiquidity: "70" }] }),
    );
    let enriched = false;
    const liquidity = client
      .getMorphoMarketsSharedLiquidity({ chainId: 8453, markets })
      .then((result) => {
        enriched = true;
        return result;
      });
    const refreshed = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    expect(refreshed[0]?.availableLiquidity.value).toBe(70);
    expect(enriched).toBe(false);
    slow.resolve(response(emptyLiquidity));
    expect((await liquidity)[0]?.reallocatableLiquidityAssets.value).toBe(0);
    expect(markets[0]?.sharedLiquidityStatus).toBe("not-requested");
  });

  it("returns nonzero allocations with transaction parameters without mutating base balances", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    const target = markets[0];
    if (!target) throw new Error("Expected a base market");
    const sourceId =
      "0x1111111111111111111111111111111111111111111111111111111111111111";
    const source: (typeof markets)[number] = {
      ...target,
      marketId: sourceId,
      collateralToken: {
        ...target.collateralToken,
        address: "0x0000000000000000000000000000000000000000",
      },
    };
    get.mockClear().mockResolvedValue(
      response({
        vaults: [
          {
            address: "0xvault",
            name: "Vault",
            fee: "0",
            markets: [
              {
                marketId: id,
                flowCapIn: "100000000000000000000",
                flowCapOut: "0",
                supplyCap: "0",
                supplyCapEnabled: false,
                vaultSupplyShares: "0",
                vaultSupplyAssets: "1000000000000000000",
              },
              {
                marketId: sourceId,
                flowCapIn: "0",
                flowCapOut: "8000000000000000000",
                supplyCap: "0",
                supplyCapEnabled: false,
                vaultSupplyShares: "0",
                vaultSupplyAssets: "10000000000000000000",
              },
            ],
          },
        ],
        markets: {
          [id]: { totalLiquidity: "60", loanToken: row.loanToken },
          [sourceId]: { totalLiquidity: "9", loanToken: row.loanToken },
        },
      }),
    );
    const enriched = await client.getMorphoMarketsSharedLiquidity({
      chainId: 8453,
      markets: [target, source],
    });
    expect(enriched[0]?.reallocatableLiquidityAssets.value).toBe(8);
    expect(enriched[0]?.publicAllocatorSharedLiquidity[0]).toMatchObject({
      assets: 8,
      allocationMarket: {
        uniqueKey: sourceId,
        oracleAddress: row.oracle,
        irmAddress: row.irm,
        lltv: "945000000000000000",
        loanAsset: { address: row.loanToken.address },
        collateralAsset: { address: row.collateralToken.address },
      },
    });
    expect(target.availableLiquidity.value).toBe(60);
    expect(target.publicAllocatorSharedLiquidity).toEqual([]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid deadline %s before starting an HTTP request",
    async (timeoutMs) => {
      const get = api();
      const markets = await client.getMorphoMarkets({
        chainId: 8453,
        includeSharedLiquidity: false,
      });
      get.mockClear();
      await expect(
        client.getMorphoMarketsSharedLiquidity({
          chainId: 8453,
          markets,
          timeoutMs,
        }),
      ).rejects.toBeInstanceOf(RangeError);
      expect(get).not.toHaveBeenCalled();
    },
  );

  it("fetches allocator data only and rejects failures instead of publishing an apparent zero", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    get.mockClear();
    const error = new Error("upstream unavailable");
    get.mockRejectedValue(error);
    await expect(
      client.getMorphoMarketsSharedLiquidity({ chainId: 8453, markets }),
    ).rejects.toBe(error);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0]?.[0]).toContain("/isolated/shared-liquidity/8453");
    expect(markets[0]?.availableLiquidity.value).toBe(60);
  });

  it("marks legacy enrichment failures unavailable while preserving usable base data", async () => {
    const get = api();
    get.mockImplementation(async (url) => {
      if (url.includes("shared-liquidity")) throw new Error("unavailable");
      return response({ results: [row] });
    });
    const markets = await client.getMorphoMarkets({ chainId: 8453 });
    expect(markets[0]).toMatchObject({
      sharedLiquidityStatus: "unavailable",
      availableLiquidityUsd: 120000,
    });
  });

  it("rejects mixed-chain inputs before fetching", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    get.mockClear();
    const wrongChain = markets.map((market) => ({ ...market, chainId: 10 }));
    await expect(
      client.getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets: wrongChain,
      }),
    ).rejects.toThrow("requested chain");
    expect(get).not.toHaveBeenCalled();
  });

  it("enforces one deadline across retries and backoff", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    vi.useFakeTimers();
    get
      .mockReset()
      .mockRejectedValue(new AxiosError("network error", "ERR_NETWORK"));
    const request = client
      .getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets,
        timeoutMs: 300,
      })
      .catch((error) => error);
    await vi.advanceTimersByTimeAsync(300);
    expect(axios.isCancel(await request)).toBe(true);
    expect(get).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("aborts an in-flight request and stops its deadline timer", async () => {
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    vi.useFakeTimers();
    get.mockReset().mockImplementation(
      (_url, config?: AxiosRequestConfig) =>
        new Promise((_resolve, reject) => {
          config?.signal?.addEventListener?.("abort", () =>
            reject(new axios.CanceledError()),
          );
        }),
    );
    const controller = new AbortController();
    const request = client
      .getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets,
        signal: controller.signal,
      })
      .catch((error) => error);
    controller.abort();
    expect(axios.isCancel(await request)).toBe(true);
    expect(get).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

function fallbackEnvironment(): Environment {
  return {
    ...client.environments.base,
    lunarIndexerUrl: undefined,
    contracts: {
      morphoViews: {
        read: {
          getMorphoBlueMarketsInfo: vi.fn().mockResolvedValue([
            {
              marketId: id,
              loanToken: row.loanToken.address,
              collateralToken: row.collateralToken.address,
              oracle: row.oracle,
              irm: row.irm,
              lltv: 945000000000000000n,
              fee: 0n,
              oraclePrice: 1200000000000000000000000000000000000n,
              collateralPrice: 2400000000000000000000n,
              loanPrice: 2000000000000000000000n,
              totalSupplyAssets: 100000000000000000000n,
              totalBorrowAssets: 40000000000000000000n,
              borrowApy: 50000000000000000n,
            },
          ]),
        },
      },
    },
  } as unknown as Environment;
}
function morphoFetch() {
  return vi.fn().mockResolvedValue({
    status: 200,
    json: async () => ({
      data: {
        markets: {
          items: [
            {
              marketId: id,
              morphoBlue: { chain: { id: 8453 } },
              collateralAsset: { decimals: 18 },
              loanAsset: { decimals: 18, priceUsd: 2000 },
              reallocatableLiquidityAssets: "0",
              publicAllocatorSharedLiquidity: [],
              state: {
                collateralAssets: "25000000000000000000",
                collateralAssetsUsd: 60000,
                rewards: [
                  {
                    asset: {
                      address: "0x0000000000000000000000000000000000000003",
                      symbol: "RWD",
                      name: "Reward",
                      decimals: 18,
                    },
                    supplyApr: 0,
                    borrowApr: 0.01,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
  });
}

describe("on-chain fallback", () => {
  it.each([false, true])(
    "fetches collateral and optional rewards once, without allocator fields (rewards=%s)",
    async (includeRewards) => {
      const fetch = morphoFetch();
      vi.stubGlobal("fetch", fetch);
      const markets = await getMorphoMarketsData({
        environments: [fallbackEnvironment()],
        includeSharedLiquidity: false,
        includeRewards,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
      const query = JSON.parse(fetch.mock.calls[0]?.[1].body).query;
      expect(query).not.toContain("publicAllocatorSharedLiquidity");
      expect(query).not.toContain("reallocatableLiquidityAssets");
      expect(query.includes("rewards {")).toBe(includeRewards);
      expect(markets[0]?.collateralAssets?.value).toBe(25);
      expect(markets[0]?.sharedLiquidityStatus).toBe("not-requested");
      expect(markets[0]?.totalBorrowApr).toBe(includeRewards ? 4 : 5);
    },
  );
  it("preserves the opt-out when the indexer fails and RPC fallback is used", async () => {
    vi.spyOn(axios, "get").mockRejectedValue(new Error("indexer unavailable"));
    const fetch = morphoFetch();
    vi.stubGlobal("fetch", fetch);
    const environment = {
      ...fallbackEnvironment(),
      lunarIndexerUrl: "https://indexer.invalid",
    };
    const markets = await getMorphoMarketsData({
      environments: [environment],
      includeSharedLiquidity: false,
      includeRewards: true,
    });
    expect(markets[0]?.sharedLiquidityStatus).toBe("not-requested");
    expect(JSON.parse(fetch.mock.calls[0]?.[1].body).query).not.toContain(
      "publicAllocatorSharedLiquidity",
    );
  });
});
