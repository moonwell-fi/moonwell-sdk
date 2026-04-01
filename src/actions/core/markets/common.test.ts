import { afterEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../../test/client.js";
import { getMarketsData } from "./common.js";

// Moonriver underlying token addresses (from environment config)
const MOVR_ADDRESS = "0x0000000000000000000000000000000000000000";
const FRAX_ADDRESS = "0x1a93b23281cc1cde4c4741353f3064709a16197d";

/**
 * Stubs global fetch so that requests to coins.llama.fi return the given
 * prices while all other requests (e.g. viem RPC calls) go through normally.
 */
function mockDefiLlamaPrices(prices: Record<string, number>) {
  const coins: Record<string, { price: number }> = {};
  for (const [addr, price] of Object.entries(prices)) {
    coins[`moonriver:${addr}`] = { price };
  }

  const originalFetch = globalThis.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (url.startsWith("https://coins.llama.fi")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ coins }),
        });
      }
      return originalFetch(url, init);
    }),
  );
}

describe("getMarketsData — Moonriver", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("applies DefiLlama prices to market USD values", async () => {
    const MOCK_MOVR_PRICE = 8.5;
    mockDefiLlamaPrices({ [MOVR_ADDRESS]: MOCK_MOVR_PRICE });

    const markets = await getMarketsData(testClient.environments.moonriver);

    expect(markets.length).toBeGreaterThan(0);

    const movrMarket = markets.find((m) => m.marketKey === "MOONWELL_MOVR");
    expect(movrMarket).toBeDefined();
    expect(movrMarket?.underlyingPrice).toBe(MOCK_MOVR_PRICE);

    if (movrMarket && movrMarket.totalSupply.value > 0) {
      expect(movrMarket.totalSupplyUsd).toBeCloseTo(
        movrMarket.totalSupply.value * MOCK_MOVR_PRICE,
        5,
      );
    }
  });

  test("uses 0 for USD values when a token has no DefiLlama price", async () => {
    // Provide MOVR price only — FRAX gets no price entry
    mockDefiLlamaPrices({ [MOVR_ADDRESS]: 8.5 });

    const markets = await getMarketsData(testClient.environments.moonriver);

    const fraxMarket = markets.find((m) => m.marketKey === "MOONWELL_FRAX");
    expect(fraxMarket).toBeDefined();
    expect(fraxMarket?.underlyingPrice).toBe(0);
    expect(fraxMarket?.totalSupplyUsd).toBe(0);
    expect(fraxMarket?.totalBorrowsUsd).toBe(0);
  });

  test("falls back to USD = 0 when DefiLlama fetch fails", async () => {
    const originalFetch = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (url.startsWith("https://coins.llama.fi")) {
          return Promise.reject(new Error("Network error"));
        }
        return originalFetch(url, init);
      }),
    );

    const markets = await getMarketsData(testClient.environments.moonriver);

    expect(markets.length).toBeGreaterThan(0);
    for (const market of markets) {
      expect(market.underlyingPrice).toBe(0);
      expect(market.totalSupplyUsd).toBe(0);
      expect(market.totalBorrowsUsd).toBe(0);
    }
  });

  test("falls back to USD = 0 when DefiLlama returns malformed response", async () => {
    const originalFetch = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (url.startsWith("https://coins.llama.fi")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ unexpected: "shape" }),
          });
        }
        return originalFetch(url, init);
      }),
    );

    const markets = await getMarketsData(testClient.environments.moonriver);

    expect(markets.length).toBeGreaterThan(0);
    for (const market of markets) {
      expect(market.underlyingPrice).toBe(0);
    }
  });

  test("does not use stale on-chain oracle prices", async () => {
    // The stale Views contract oracle returns MOVR at $46.17.
    // This test confirms we use the DefiLlama price instead.
    const DEFILLAMA_PRICE = 9.0;
    mockDefiLlamaPrices({ [MOVR_ADDRESS]: DEFILLAMA_PRICE });

    const markets = await getMarketsData(testClient.environments.moonriver);

    const movrMarket = markets.find((m) => m.marketKey === "MOONWELL_MOVR");
    expect(movrMarket?.underlyingPrice).toBe(DEFILLAMA_PRICE);
    expect(movrMarket?.underlyingPrice).not.toBeCloseTo(46.17, 0);
  });

  test("fetches prices from the DefiLlama coins API", async () => {
    mockDefiLlamaPrices({ [MOVR_ADDRESS]: 8.5, [FRAX_ADDRESS]: 1.0 });

    await getMarketsData(testClient.environments.moonriver);

    const fetchMock = vi.mocked(globalThis.fetch);
    const llamaCall = fetchMock.mock.calls.find(([url]) =>
      String(url).startsWith("https://coins.llama.fi"),
    );
    expect(llamaCall).toBeDefined();
    expect(llamaCall?.[0]).toContain("moonriver:");
  });
});
