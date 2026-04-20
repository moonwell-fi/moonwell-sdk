import axios from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../test/client.js";
import { getCirculatingSupplySnapshots } from "./getCirculatingSupplySnapshots.js";

// WELL token on Base — configured in the base environment
const WELL_ADDRESS = "0xA88594D404727625A9437C3f886C7643872296AE";
const CHAIN_ID = 8453;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: `${CHAIN_ID}-${WELL_ADDRESS}-1000000`,
    chainId: CHAIN_ID,
    tokenAddress: WELL_ADDRESS,
    tokenLabel: "WELL",
    timestamp: 1700000000,
    blockNumber: "12345678",
    totalSupply: "5000000000.0",
    excludedBalance: "1000000000.0",
    circulatingSupply: "4000000000.0",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCirculatingSupplySnapshots — lunar indexer path", () => {
  test("single-page response maps to CirculatingSupplySnapshot correctly", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: { results: [makeSnapshot()], nextCursor: null },
    });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(result).toHaveLength(1);
    const snap = result[0]!;
    expect(snap.chainId).toBe(CHAIN_ID);
    expect(snap.token.symbol).toBe("WELL");
    expect(snap.circulatingSupply).toBeCloseTo(4_000_000_000, 0);
    expect(snap.totalSupply).toBe("5000000000.0");
    expect(snap.excludedBalance).toBe("1000000000.0");
    expect(snap.timestamp).toBe(1700000000);
  });

  test("follows cursor across multiple pages until nextCursor is null", async () => {
    const page1Snapshot = makeSnapshot({ timestamp: 1700000000 });
    const page2Snapshot = makeSnapshot({ timestamp: 1700086400 });

    vi.spyOn(axios, "get")
      .mockResolvedValueOnce({
        data: { results: [page1Snapshot], nextCursor: "cursor-abc" },
      })
      .mockResolvedValueOnce({
        data: { results: [page2Snapshot], nextCursor: null },
      });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.timestamp).toBe(1700000000);
    expect(result[1]?.timestamp).toBe(1700086400);

    // Second call should include the cursor as a query param
    const getSpy = vi.mocked(axios.get);
    const secondCallParams = (getSpy.mock.calls[1] as unknown[])[1] as {
      params: Record<string, string>;
    };
    expect(secondCallParams.params.cursor).toBe("cursor-abc");
  });

  test("stops fetching after MAX_PAGES (10) even if cursor is still non-null", async () => {
    // Always returns a cursor, simulating an infinite stream
    vi.spyOn(axios, "get").mockResolvedValue({
      data: { results: [makeSnapshot()], nextCursor: "always-more" },
    });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    // MAX_PAGES = 10 → exactly 10 calls, 10 snapshots
    expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(10);
    expect(result).toHaveLength(10);
  });

  test("filters out snapshots whose token address is not in the environment config", async () => {
    const unknownAddress = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: {
        results: [
          makeSnapshot(),
          makeSnapshot({ tokenAddress: unknownAddress }),
        ],
        nextCursor: null,
      },
    });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    // Only the WELL snapshot should survive — unknown token is filtered out
    expect(result).toHaveLength(1);
    expect(result[0]?.token.symbol).toBe("WELL");
  });

  test("returns empty array when lunar returns no results", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: { results: [], nextCursor: null },
    });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(result).toEqual([]);
  });
});

describe("getCirculatingSupplySnapshots — Ponder path (indexerUrl, no lunarIndexerUrl)", () => {
  const MOCK_PONDER_URL = "https://mock-ponder.test";
  const MOONRIVER_CHAIN_ID = 1285;
  const MFAM_ADDRESS = "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b";

  const ponderClient = {
    environments: {
      moonriver: {
        chainId: MOONRIVER_CHAIN_ID,
        lunarIndexerUrl: undefined,
        indexerUrl: MOCK_PONDER_URL,
        config: {
          tokens: {
            MFAM: { address: MFAM_ADDRESS, symbol: "MFAM", decimals: 18 },
          },
        },
      },
    },
  } as never;

  test("calls axios.post with indexerUrl when no lunarIndexerUrl", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: { data: { circulatingSupplyDailySnapshots: { items: [] } } },
    });
    const getSpy = vi.spyOn(axios, "get");

    await getCirculatingSupplySnapshots(ponderClient, {
      chainId: MOONRIVER_CHAIN_ID,
    });

    expect(postSpy).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.objectContaining({
        query: expect.stringContaining(`chainId: ${MOONRIVER_CHAIN_ID}`),
      }),
    );
    expect(getSpy).not.toHaveBeenCalled();
  });

  test("returns mapped snapshot data from Ponder", async () => {
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          circulatingSupplyDailySnapshots: {
            items: [
              {
                chainId: MOONRIVER_CHAIN_ID,
                tokenAddress: MFAM_ADDRESS,
                circulatingSupply: 500_000_000,
                timestamp: 1700000000,
              },
            ],
          },
        },
      },
    });

    const result = await getCirculatingSupplySnapshots(ponderClient, {
      chainId: MOONRIVER_CHAIN_ID,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.circulatingSupply).toBe(500_000_000);
    expect(result[0]?.chainId).toBe(MOONRIVER_CHAIN_ID);
    expect(result[0]?.token.symbol).toBe("MFAM");
  });

  test("returns [] when both lunarIndexerUrl and indexerUrl are absent", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const noUrlClient = {
      environments: {
        moonriver: {
          chainId: MOONRIVER_CHAIN_ID,
          lunarIndexerUrl: undefined,
          indexerUrl: undefined,
          config: { tokens: {} },
        },
      },
    } as never;

    const result = await getCirculatingSupplySnapshots(noUrlClient, {
      chainId: MOONRIVER_CHAIN_ID,
    });

    expect(result).toEqual([]);
    expect(postSpy).not.toHaveBeenCalled();
  });
});

describe("getCirculatingSupplySnapshots — integration", () => {
  test("fetches live data from lunar indexer", async () => {
    const baseEnvironment = testClient.environments.base;
    if (!baseEnvironment?.lunarIndexerUrl) {
      console.log("Skipping: lunar indexer URL not configured");
      return;
    }

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      const snap = result[0]!;
      expect(snap.chainId).toBe(CHAIN_ID);
      expect(snap.token).toBeDefined();
      expect(typeof snap.circulatingSupply).toBe("number");
      expect(snap.circulatingSupply).toBeGreaterThan(0);
      expect(snap.timestamp).toBeGreaterThan(0);
    }
    console.log(`Fetched ${result.length} circulating supply snapshots`);
  }, 30000);
});
