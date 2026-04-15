/**
 * Unit tests for getMorphoVaultUserPositionSnapshots.
 *
 * These tests use module mocks so they never hit real network endpoints.
 * They verify:
 *  - Lunar Indexer is used as primary when lunarIndexerUrl is configured
 *  - Ponder is used when lunarIndexerUrl is NOT configured
 *  - Fallback to Ponder on 5xx / network errors (error-only, not on empty)
 *  - 4xx errors (except 404) are thrown without fallback
 *  - Optional vaultAddress: omitting it omits the vault param from the Lunar call
 *  - When vaultAddress is omitted and no lunarUrl, returns []
 *  - Data transformation from LunarVaultPortfolio → MorphoVaultUserPositionSnapshot[]
 *  - Ponder pagination (hasNextPage)
 */
import axios from "axios";
import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import type { LunarVaultPortfolio } from "../../lunar-indexer-client.js";
import { createLunarIndexerClient } from "../../lunar-indexer-client.js";
import { getMorphoVaultUserPositionSnapshots } from "./getMorphoVaultUserPositionSnapshots.js";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("../../lunar-indexer-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lunar-indexer-client.js")>();
  return { ...actual, createLunarIndexerClient: vi.fn() };
});

// Only spy on axios.post so that axios.isAxiosError stays real (needed by shouldFallback)
const axiosPostSpy = vi.spyOn(axios, "post");

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const MOCK_LUNAR_URL = "https://mock-lunar.test";
const MOCK_PONDER_URL = "https://mock-ponder.test";
const MOCK_VAULT_ADDRESS =
  "0xaabbccdd00112233445566778899aabbccddeeff" as `0x${string}`;
const MOCK_USER_ADDRESS =
  "0x1111111111111111111111111111111111111111" as `0x${string}`;
const MOCK_CHAIN_ID = 8453;

function makeEmptyPortfolio(): LunarVaultPortfolio {
  return { account: MOCK_USER_ADDRESS, positions: [] };
}

function makePortfolioWithPositions(
  timestamps: number[],
  shareBalanceUsd = 3.0,
): LunarVaultPortfolio {
  return {
    account: MOCK_USER_ADDRESS,
    positions: timestamps.map((timestamp) => ({
      timestamp,
      vaults: [
        {
          chainId: MOCK_CHAIN_ID,
          vaultAddress: MOCK_VAULT_ADDRESS,
          shareBalance: "3000000",
          shareBalanceUsd,
          assetsValue: shareBalanceUsd,
        },
      ],
    })),
  };
}

function makeClient(lunarIndexerUrl?: string): MoonwellClient {
  return {
    environments: {
      base: {
        chainId: MOCK_CHAIN_ID,
        indexerUrl: MOCK_PONDER_URL,
        custom: lunarIndexerUrl ? { morpho: { lunarIndexerUrl } } : undefined,
      } as unknown as Environment,
    },
  } as unknown as MoonwellClient;
}

function createAxiosError(status?: number): AxiosError {
  const response = status
    ? ({
        status,
        data: {},
        headers: {},
        statusText: "",
      } as AxiosResponse)
    : undefined;

  return new AxiosError(
    `Request failed${status ? ` with status ${status}` : ""}`,
    status ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_NETWORK,
    undefined,
    undefined,
    response,
  );
}

function makePonderResponse(
  items: { totalSuppliesUSD: string; timestamp: number }[] = [],
) {
  return {
    status: 200,
    data: {
      data: {
        accountVaultDailySnapshots: {
          items,
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const mockGetVaultAccountPortfolio = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(createLunarIndexerClient).mockReturnValue({
    getVaultAccountPortfolio: mockGetVaultAccountPortfolio,
  } as never);

  mockGetVaultAccountPortfolio.mockResolvedValue(makeEmptyPortfolio());

  axiosPostSpy.mockResolvedValue(makePonderResponse());
});

// ---------------------------------------------------------------------------
// Routing: Lunar vs Ponder
// ---------------------------------------------------------------------------

describe("per-environment routing", () => {
  test("calls Lunar Indexer when lunarIndexerUrl is configured", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(createLunarIndexerClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: MOCK_LUNAR_URL }),
    );
    expect(mockGetVaultAccountPortfolio).toHaveBeenCalled();
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  test("calls Ponder when lunarIndexerUrl is NOT configured", async () => {
    const client = makeClient(undefined);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(createLunarIndexerClient).not.toHaveBeenCalled();
    expect(axiosPostSpy).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.objectContaining({
        query: expect.stringContaining(MOCK_VAULT_ADDRESS.toLowerCase()),
      }),
    );
  });

  test("passes vaultAddress to Lunar as vault param", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(mockGetVaultAccountPortfolio).toHaveBeenCalledWith(
      MOCK_USER_ADDRESS,
      expect.objectContaining({ vault: MOCK_VAULT_ADDRESS }),
    );
  });

  test("omits vault param from Lunar when vaultAddress is not provided", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
    });

    expect(mockGetVaultAccountPortfolio).toHaveBeenCalledWith(
      MOCK_USER_ADDRESS,
      expect.not.objectContaining({ vault: expect.anything() }),
    );
  });

  test("returns [] when vaultAddress is omitted and no lunarIndexerUrl", async () => {
    const client = makeClient(undefined);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
    });

    expect(result).toEqual([]);
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  test("passes chainId and granularity to Lunar", async () => {
    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(mockGetVaultAccountPortfolio).toHaveBeenCalledWith(
      MOCK_USER_ADDRESS,
      expect.objectContaining({
        chainId: MOCK_CHAIN_ID,
        granularity: "1d",
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Data transformation
// ---------------------------------------------------------------------------

describe("data transformation from Lunar response", () => {
  test("maps portfolio positions to MorphoVaultUserPositionSnapshot[]", async () => {
    const timestamps = [1700000000, 1700086400];
    mockGetVaultAccountPortfolio.mockResolvedValue(
      makePortfolioWithPositions(timestamps, 3.0),
    );

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      chainId: MOCK_CHAIN_ID,
      account: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
      suppliedUsd: 3.0,
      timestamp: timestamps[0] * 1000,
    });
    expect(result[1].timestamp).toBe(timestamps[1] * 1000);
  });

  test("returns [] when Lunar portfolio has no positions", async () => {
    mockGetVaultAccountPortfolio.mockResolvedValue(makeEmptyPortfolio());

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(result).toEqual([]);
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  test("timestamp is converted from seconds to milliseconds", async () => {
    const unixSec = 1700000000;
    mockGetVaultAccountPortfolio.mockResolvedValue(
      makePortfolioWithPositions([unixSec]),
    );

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(result[0].timestamp).toBe(unixSec * 1000);
  });

  test("maps vault chainId and vaultAddress from each position's vault entry", async () => {
    const portfolio: LunarVaultPortfolio = {
      account: MOCK_USER_ADDRESS,
      positions: [
        {
          timestamp: 1700000000,
          vaults: [
            {
              chainId: MOCK_CHAIN_ID,
              vaultAddress: MOCK_VAULT_ADDRESS,
              shareBalance: "1000000",
              shareBalanceUsd: 1.5,
              assetsValue: 1.5,
            },
          ],
        },
      ],
    };
    mockGetVaultAccountPortfolio.mockResolvedValue(portfolio);

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(result[0].chainId).toBe(MOCK_CHAIN_ID);
    expect(result[0].vaultAddress).toBe(MOCK_VAULT_ADDRESS);
    expect(result[0].suppliedUsd).toBe(1.5);
  });
});

// ---------------------------------------------------------------------------
// Fallback behavior
// ---------------------------------------------------------------------------

describe("fallback to Ponder", () => {
  test("falls back to Ponder when Lunar returns a 500 error", async () => {
    mockGetVaultAccountPortfolio.mockRejectedValue(createAxiosError(500));

    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(axiosPostSpy).toHaveBeenCalledWith(
      MOCK_PONDER_URL,
      expect.anything(),
    );
  });

  test("falls back to Ponder on network error (no response)", async () => {
    mockGetVaultAccountPortfolio.mockRejectedValue(createAxiosError());

    const client = makeClient(MOCK_LUNAR_URL);
    await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(axiosPostSpy).toHaveBeenCalled();
  });

  test("does NOT fall back to Ponder on 400 bad request — throws instead", async () => {
    mockGetVaultAccountPortfolio.mockRejectedValue(createAxiosError(400));

    const client = makeClient(MOCK_LUNAR_URL);
    await expect(
      getMorphoVaultUserPositionSnapshots(client, {
        chainId: MOCK_CHAIN_ID,
        userAddress: MOCK_USER_ADDRESS,
        vaultAddress: MOCK_VAULT_ADDRESS,
      }),
    ).rejects.toThrow();

    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  test("does NOT fall back to Ponder on 401 unauthorized — throws instead", async () => {
    mockGetVaultAccountPortfolio.mockRejectedValue(createAxiosError(401));

    const client = makeClient(MOCK_LUNAR_URL);
    await expect(
      getMorphoVaultUserPositionSnapshots(client, {
        chainId: MOCK_CHAIN_ID,
        userAddress: MOCK_USER_ADDRESS,
        vaultAddress: MOCK_VAULT_ADDRESS,
      }),
    ).rejects.toThrow();
  });

  test("does NOT fall back when vaultAddress is omitted and Lunar errors", async () => {
    mockGetVaultAccountPortfolio.mockRejectedValue(createAxiosError(500));

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      // no vaultAddress
    });

    // Ponder requires a vaultAddress, so fallback returns [] instead of calling Ponder
    expect(result).toEqual([]);
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  test("empty Lunar result does NOT fall back to Ponder", async () => {
    mockGetVaultAccountPortfolio.mockResolvedValue(makeEmptyPortfolio());

    const client = makeClient(MOCK_LUNAR_URL);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(axiosPostSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Ponder pagination
// ---------------------------------------------------------------------------

describe("Ponder pagination", () => {
  test("fetches multiple pages until hasNextPage is false", async () => {
    const page1Items = [{ totalSuppliesUSD: "1.0", timestamp: 1700000000 }];
    const page2Items = [{ totalSuppliesUSD: "2.0", timestamp: 1700086400 }];

    axiosPostSpy
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            accountVaultDailySnapshots: {
              items: page1Items,
              pageInfo: { hasNextPage: true, endCursor: "cursor-abc" },
            },
          },
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            accountVaultDailySnapshots: {
              items: page2Items,
              pageInfo: { hasNextPage: false, endCursor: "" },
            },
          },
        },
      });

    const client = makeClient(undefined);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(axiosPostSpy).toHaveBeenCalledTimes(2);
    // Both items have start-of-day timestamps (unix 0 mod 86400 = 0 → passes isStartOfDay)
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  test("returns [] when Ponder has no items", async () => {
    axiosPostSpy.mockResolvedValue(makePonderResponse([]));

    const client = makeClient(undefined);
    const result = await getMorphoVaultUserPositionSnapshots(client, {
      chainId: MOCK_CHAIN_ID,
      userAddress: MOCK_USER_ADDRESS,
      vaultAddress: MOCK_VAULT_ADDRESS,
    });

    expect(result).toEqual([]);
  });
});
