import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import {
  type LunarMarketLiveData,
  type LunarSharedLiquidityResponse,
  getMorphoMarketsData,
} from "./common.js";
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
const sourceId =
  "0x1111111111111111111111111111111111111111111111111111111111111111";
function liquidityFixture() {
  const target = {
    marketId: id,
    flowCapIn: "100000000000000000000",
    flowCapOut: "0",
    supplyCap: "0",
    supplyCapEnabled: false,
    vaultSupplyShares: "0",
    vaultSupplyAssets: "1000000000000000000",
  };
  const source = {
    ...target,
    marketId: sourceId,
    flowCapIn: "0",
    flowCapOut: "8000000000000000000",
    vaultSupplyAssets: "10000000000000000000",
  };
  const sourceLive: LunarMarketLiveData = {
    totalLiquidity: "9",
    loanToken: { ...row.loanToken },
  };
  const vault = {
    address: "0xvault",
    name: "Vault",
    fee: "0",
    markets: [target, source],
  };
  const data: LunarSharedLiquidityResponse = {
    vaults: [vault],
    markets: {
      [id]: { totalLiquidity: "60", loanToken: { ...row.loanToken } },
      [sourceId]: sourceLive,
    },
  };
  return { data, target, source, sourceLive, vault };
}
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

describe("allocator response validation", () => {
  async function expectInvalidLiquidity(
    fixture: ReturnType<typeof liquidityFixture>,
  ) {
    const onError = vi.fn();
    const checkedClient = createMoonwellClient({
      networks: { base: { rpcUrls: ["https://rpc.invalid"] } },
      onError,
    });
    const get = api();
    const base = await checkedClient.getMorphoMarkets({
      chainId: 8453,
      includeRewards: true,
      includeSharedLiquidity: false,
    });
    get
      .mockClear()
      .mockImplementation(async (url) =>
        response(
          url.includes("shared-liquidity") ? fixture.data : { results: [row] },
        ),
      );
    await expect(
      checkedClient.getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets: base,
      }),
    ).rejects.toBeInstanceOf(TypeError);
    expect(get).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(TypeError), {
      source: "morpho-shared-liquidity",
      chainId: 8453,
    });
    const enriched = await checkedClient.getMorphoMarkets({
      chainId: 8453,
      includeRewards: true,
    });
    expect(enriched[0]).toMatchObject({
      sharedLiquidityStatus: "unavailable",
      publicAllocatorSharedLiquidity: [],
      availableLiquidityUsd: 120000,
      collateralAssetsUsd: 60000,
      totalSupplyApr: 5,
      totalBorrowApr: 4,
    });
    expect(enriched[0]?.availableLiquidity.value).toBe(60);
    expect(enriched[0]?.collateralAssets?.value).toBe(25);
    expect(enriched[0]?.rewards).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenCalledTimes(3);
    expect(base[0]?.sharedLiquidityStatus).toBe("not-requested");
    expect(base[0]?.publicAllocatorSharedLiquidity).toEqual([]);
  }

  it.each([
    "invalid",
    "9oops",
    "",
    " ",
    "Infinity",
    "NaN",
    "1e309",
    "-1",
    "0x10",
    null,
    true,
    9,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    {},
  ])(
    "rejects invalid totalLiquidity %j in both loading paths",
    async (value) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture.sourceLive, "totalLiquidity", value);
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each(
    [
      "flowCapIn",
      "flowCapOut",
      "supplyCap",
      "vaultSupplyShares",
      "vaultSupplyAssets",
    ].flatMap((field) =>
      ["invalid", undefined, "-1", "0.5"].map((value) => ({ field, value })),
    ),
  )(
    "rejects $field=$value before computing either loading path",
    async ({ field, value }) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture.target, field, value);
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each(["invalid", undefined, "-1", "1e18"])(
    "rejects an invalid raw fee %s",
    async (fee) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture.vault, "fee", fee);
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each([undefined, "false", null])(
    "rejects invalid supplyCapEnabled %s",
    async (enabled) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture.target, "supplyCapEnabled", enabled);
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each([
    undefined,
    "18",
    -1,
    18.5,
    256,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])("rejects invalid loan token decimals %s", async (decimals) => {
    const fixture = liquidityFixture();
    fixture.sourceLive.loanToken = { ...row.loanToken };
    Reflect.set(fixture.sourceLive.loanToken, "decimals", decimals);
    await expectInvalidLiquidity(fixture);
  });

  it.each<LunarMarketLiveData>([
    {},
    { totalSupplyAssets: "9" },
    { totalBorrowAssets: "1" },
    { totalSupplyAssets: "invalid", totalBorrowAssets: "0" },
    { totalSupplyAssets: "9", totalBorrowAssets: " " },
    { totalSupplyAssets: "9", totalBorrowAssets: "10" },
  ])("rejects missing or invalid supply-minus-borrow data %j", async (live) => {
    const fixture = liquidityFixture();
    fixture.data.markets[sourceId] = live;
    await expectInvalidLiquidity(fixture);
  });

  it.each(["totalSupplyAssets", "totalBorrowAssets"])(
    "validates a supplied %s even when totalLiquidity is present",
    async (field) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture.sourceLive, field, "invalid");
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each([null, {}, { vaults: [], markets: [] }, { vaults: {}, markets: {} }])(
    "rejects an invalid response envelope %j",
    async (data) => {
      const fixture = liquidityFixture();
      Reflect.set(fixture, "data", data);
      await expectInvalidLiquidity(fixture);
    },
  );

  it.each([
    { totalSupplyAssets: "10", totalBorrowAssets: "1", expected: 8 },
    { totalSupplyAssets: "2.5e1", totalBorrowAssets: "1.75e1", expected: 7.5 },
    { totalSupplyAssets: "9", totalBorrowAssets: "9", expected: 0 },
    {
      totalLiquidity: "0",
      totalSupplyAssets: "9",
      totalBorrowAssets: "0",
      expected: 0,
    },
  ])(
    "preserves valid liquidity and the supply-minus-borrow fallback %j",
    async ({ expected, ...live }) => {
      const fixture = liquidityFixture();
      fixture.data.markets[sourceId] = { ...live, loanToken: row.loanToken };
      const get = api();
      const base = await client.getMorphoMarkets({
        chainId: 8453,
        includeSharedLiquidity: false,
      });
      get.mockImplementation(async (url) =>
        response(
          url.includes("shared-liquidity") ? fixture.data : { results: [row] },
        ),
      );
      const result = await client.getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets: base,
      });
      expect(result[0]?.reallocatableLiquidityAssets.value).toBe(expected);
      const enriched = await client.getMorphoMarkets({ chainId: 8453 });
      expect(enriched[0]?.sharedLiquidityStatus).toBe("available");
      expect(
        enriched[0]?.publicAllocatorSharedLiquidity.reduce(
          (total, allocation) => total + allocation.assets,
          0,
        ),
      ).toBe(expected);
    },
  );

  it("accepts large raw integers and applies a real supply cap", async () => {
    const fixture = liquidityFixture();
    const maxUint256 = ((1n << 256n) - 1n).toString();
    fixture.target.flowCapIn = maxUint256;
    fixture.target.vaultSupplyShares = maxUint256;
    fixture.source.vaultSupplyShares = maxUint256;
    fixture.vault.fee = maxUint256;
    fixture.target.supplyCapEnabled = true;
    fixture.target.supplyCap = "2000000000000000000";
    const get = api();
    const base = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    get.mockResolvedValue(response(fixture.data));
    const result = await client.getMorphoMarketsSharedLiquidity({
      chainId: 8453,
      markets: base,
    });
    expect(result[0]?.reallocatableLiquidityAssets.value).toBe(1);
    expect(
      result[0]?.publicAllocatorSharedLiquidity[0]?.vault.publicAllocatorConfig
        .fee,
    ).toBe(Number(maxUint256));
    expect(fixture.target.flowCapIn).toBe(maxUint256);
  });

  it("preserves valid allocations when the indexer omits another source record", async () => {
    const fixture = liquidityFixture();
    fixture.vault.markets.push({
      ...fixture.source,
      marketId:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
    });
    const get = api();
    const base = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    get.mockImplementation(async (url) =>
      response(
        url.includes("shared-liquidity") ? fixture.data : { results: [row] },
      ),
    );
    const result = await client.getMorphoMarketsSharedLiquidity({
      chainId: 8453,
      markets: base,
    });
    expect(result[0]?.reallocatableLiquidityAssets.value).toBe(8);
    expect(result[0]?.publicAllocatorSharedLiquidity).toHaveLength(1);
    const enriched = await client.getMorphoMarkets({ chainId: 8453 });
    expect(enriched[0]?.sharedLiquidityStatus).toBe("available");
    expect(enriched[0]?.publicAllocatorSharedLiquidity).toHaveLength(1);
  });
});

describe("independent isolated-market loading", () => {
  it("returns empty input without an allocator request", async () => {
    const get = api();
    expect(
      await client.getMorphoMarketsSharedLiquidity({
        chainId: 8453,
        markets: [],
      }),
    ).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects environments without an independent liquidity endpoint", async () => {
    const rpcOnly = createMoonwellClient({
      networks: { base: { rpcUrls: ["https://rpc.invalid"] } },
    });
    rpcOnly.environments.base.lunarIndexerUrl = "";
    const get = api();
    await expect(
      rpcOnly.getMorphoMarketsSharedLiquidity({ chainId: 8453, markets: [] }),
    ).rejects.toThrow("configured Lunar Indexer");
    expect(get).not.toHaveBeenCalled();
  });

  it("does not issue a request or report an error for an already aborted query", async () => {
    const onError = vi.fn();
    const cancelClient = createMoonwellClient({
      networks: { base: { rpcUrls: ["https://rpc.invalid"] } },
      onError,
    });
    const get = api();
    const markets = await client.getMorphoMarkets({
      chainId: 8453,
      includeSharedLiquidity: false,
    });
    get.mockClear();
    vi.useFakeTimers();
    const controller = new AbortController();
    controller.abort();
    const request = cancelClient.getMorphoMarketsSharedLiquidity({
      chainId: 8453,
      markets,
      signal: controller.signal,
    });
    expect(axios.isCancel(await request.catch((error) => error))).toBe(true);
    expect(onError).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

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
    const source: (typeof markets)[number] = {
      ...target,
      marketId: sourceId,
      collateralToken: {
        ...target.collateralToken,
        address: "0x0000000000000000000000000000000000000000",
      },
    };
    get.mockClear().mockResolvedValue(response(liquidityFixture().data));
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
function morphoFetch({
  nullCollateral = false,
  missingEnrichment = false,
} = {}) {
  return vi.fn(async (_url: string, options: { body: string }) => {
    const query: string = JSON.parse(options.body).query;
    return {
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
                ...(query.includes("publicAllocatorSharedLiquidity")
                  ? {
                      reallocatableLiquidityAssets: "8000000000000000000",
                      publicAllocatorSharedLiquidity: missingEnrichment
                        ? null
                        : [
                            {
                              assets: "8000000000000000000",
                              vault: {
                                address: "0xvault",
                                name: "Vault",
                                publicAllocatorConfig: {
                                  fee: 0,
                                  flowCaps: [
                                    {
                                      maxIn: 100,
                                      maxOut: 80,
                                      market: { marketId: id },
                                    },
                                  ],
                                },
                              },
                              allocationMarket: {
                                marketId: id,
                                loanAsset: { address: row.loanToken.address },
                                oracleAddress: row.oracle,
                                irmAddress: row.irm,
                                lltv: "945000000000000000",
                              },
                            },
                          ],
                    }
                  : {}),
                state: {
                  collateralAssets: nullCollateral
                    ? null
                    : "25000000000000000000",
                  collateralAssetsUsd: nullCollateral ? null : 60000,
                  ...(query.includes("rewards {")
                    ? {
                        rewards: missingEnrichment
                          ? null
                          : [
                              {
                                asset: {
                                  address:
                                    "0x0000000000000000000000000000000000000003",
                                  symbol: "RWD",
                                  name: "Reward",
                                  decimals: 18,
                                },
                                supplyApr: 0,
                                borrowApr: 0.01,
                              },
                            ],
                      }
                    : {}),
                },
              },
            ],
          },
        },
      }),
    };
  });
}

describe("on-chain fallback", () => {
  it.each([false, true])(
    "preserves enriched defaults, allocation units and reward signs (rewards=%s)",
    async (includeRewards) => {
      const fetch = morphoFetch();
      vi.stubGlobal("fetch", fetch);
      const markets = await getMorphoMarketsData({
        environments: [fallbackEnvironment()],
        includeRewards,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(markets[0]).toMatchObject({
        sharedLiquidityStatus: "available",
        totalBorrowApr: includeRewards ? 4 : 5,
        availableLiquidityUsd: 120000,
        collateralAssetsUsd: 60000,
        marketParams: {
          lltv: 945000000000000000n,
          loanToken: row.loanToken.address,
        },
        publicAllocatorSharedLiquidity: [
          {
            assets: 8,
            vault: {
              publicAllocatorConfig: {
                flowCaps: [{ market: { uniqueKey: id } }],
              },
            },
            allocationMarket: { uniqueKey: id, lltv: "945000000000000000" },
          },
        ],
      });
      expect(markets[0]?.availableLiquidity.value).toBe(60);
      expect(markets[0]?.collateralAssets?.value).toBe(25);
      expect(markets[0]?.rewards).toHaveLength(includeRewards ? 1 : 0);
    },
  );

  it("preserves null collateral and marks missing enrichment unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      morphoFetch({ nullCollateral: true, missingEnrichment: true }),
    );
    const markets = await getMorphoMarketsData({
      environments: [fallbackEnvironment()],
      includeRewards: true,
    });
    expect(markets[0]).toMatchObject({
      collateralAssets: null,
      collateralAssetsUsd: null,
      sharedLiquidityStatus: "unavailable",
      publicAllocatorSharedLiquidity: [],
      rewards: [],
      totalBorrowApr: 5,
      availableLiquidityUsd: 120000,
    });
  });

  it("keeps base balances usable when GraphQL enrichment fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("GraphQL unavailable")),
    );
    const markets = await getMorphoMarketsData({
      environments: [fallbackEnvironment()],
      includeRewards: true,
    });
    expect(markets[0]).toMatchObject({
      collateralAssets: null,
      sharedLiquidityStatus: "unavailable",
      publicAllocatorSharedLiquidity: [],
      rewards: [],
      totalBorrowApr: 5,
      availableLiquidityUsd: 120000,
    });
  });

  it("returns an empty result without enrichment when RPC fails", async () => {
    const environment = fallbackEnvironment();
    vi.mocked(
      environment.contracts.morphoViews!.read.getMorphoBlueMarketsInfo,
    ).mockRejectedValue(new Error("RPC unavailable"));
    const fetch = morphoFetch();
    vi.stubGlobal("fetch", fetch);
    expect(
      await getMorphoMarketsData({
        environments: [environment],
        includeRewards: true,
      }),
    ).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

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
