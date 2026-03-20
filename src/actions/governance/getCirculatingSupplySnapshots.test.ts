import axios, { AxiosError } from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../test/client.js";

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

function makeAxiosNetworkError(): AxiosError {
  return new AxiosError("Network Error", "ECONNREFUSED");
}

function makeAxiosHttpError(status: number): AxiosError {
  const error = new AxiosError(`HTTP ${status}`, "ERR_BAD_RESPONSE");
  (error as AxiosError & { response: unknown }).response = {
    status,
    data: null,
    statusText: String(status),
    headers: {} as never,
    config: { headers: {} as never },
  };
  return error;
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

  test("network error falls back to legacy Ponder path", async () => {
    vi.spyOn(axios, "get").mockRejectedValueOnce(makeAxiosNetworkError());

    // Ponder fallback also fails → getCirculatingSupplySnapshots returns []
    vi.spyOn(axios, "post").mockRejectedValueOnce(new Error("Ponder down"));

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    // Falls back to Ponder path (which also fails → returns [])
    expect(result).toEqual([]);
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/staking/circulating-supply/"),
      expect.anything(),
    );
    expect(vi.mocked(axios.post)).toHaveBeenCalled();
  });

  test("5xx error falls back to Ponder path", async () => {
    vi.spyOn(axios, "get").mockRejectedValueOnce(makeAxiosHttpError(503));

    const ponderSnapshot = {
      chainId: CHAIN_ID,
      tokenAddress: WELL_ADDRESS,
      circulatingSupply: 3_000_000_000,
      timestamp: 1700000000,
    };
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          circulatingSupplyDailySnapshots: { items: [ponderSnapshot] },
        },
      },
    });

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.circulatingSupply).toBe(3_000_000_000);
  });

  test("4xx error (not 404) propagates instead of falling back", async () => {
    vi.spyOn(axios, "get").mockRejectedValueOnce(makeAxiosHttpError(400));
    const postSpy = vi.spyOn(axios, "post");

    await expect(
      testClient.getCirculatingSupplySnapshots({ chainId: CHAIN_ID }),
    ).rejects.toThrow();

    // Post (Ponder fallback) must NOT have been called
    expect(postSpy).not.toHaveBeenCalled();
  });

  test("404 error falls back to Ponder path", async () => {
    vi.spyOn(axios, "get").mockRejectedValueOnce(makeAxiosHttpError(404));
    vi.spyOn(axios, "post").mockRejectedValueOnce(new Error("Ponder down"));

    const result = await testClient.getCirculatingSupplySnapshots({
      chainId: CHAIN_ID,
    });

    expect(result).toEqual([]);
    expect(vi.mocked(axios.post)).toHaveBeenCalled();
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
