import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../../environments/index.js";
import { createLunarIndexerClient } from "../../lunar-indexer-client.js";
import { getMarketsData } from "./common.js";

vi.mock("../../lunar-indexer-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lunar-indexer-client.js")>();
  return { ...actual, createLunarIndexerClient: vi.fn() };
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_LUNAR_URL = "https://mock-lunar.test";
// Use a chain ID that doesn't match any governance chain in publicEnvironments,
// so homeEnvironment falls back to the mock environment.
const MOCK_CHAIN_ID = 99999;
const MOONRIVER_CHAIN_ID = 1285;

const mockListMarkets = vi.fn();
const mockOnError = vi.fn();

function makeViews() {
  return {
    read: {
      getProtocolInfo: vi
        .fn()
        .mockResolvedValue({ seizePaused: false, transferPaused: false }),
      getAllMarketsInfo: vi.fn().mockResolvedValue([]),
      getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
      getGovernanceTokenPrice: vi.fn().mockResolvedValue(0n),
    },
  };
}

function makeEnvironment(overrides: Partial<Environment> = {}): Environment {
  return {
    chainId: MOCK_CHAIN_ID,
    lunarIndexerUrl: MOCK_LUNAR_URL,
    onError: mockOnError,
    contracts: { views: makeViews() },
    config: {
      markets: {},
      tokens: {},
      vaults: {},
      morphoMarkets: {},
      contracts: {},
    },
    custom: {},
    ...overrides,
  } as unknown as Environment;
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createLunarIndexerClient).mockReturnValue({
    listMarkets: mockListMarkets,
  } as never);
  mockListMarkets.mockResolvedValue({ results: [] });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Lunar Indexer routing", () => {
  test("uses Lunar Indexer when lunarIndexerUrl is set", async () => {
    await getMarketsData(makeEnvironment());

    expect(createLunarIndexerClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: MOCK_LUNAR_URL }),
    );
    expect(mockListMarkets).toHaveBeenCalledWith(MOCK_CHAIN_ID);
  });

  test("skips Lunar Indexer for Moonriver (chainId 1285)", async () => {
    const env = makeEnvironment({ chainId: MOONRIVER_CHAIN_ID });
    await getMarketsData(env);

    expect(createLunarIndexerClient).not.toHaveBeenCalled();
  });

  test("skips Lunar Indexer when lunarIndexerUrl is not set", async () => {
    const env = makeEnvironment({ lunarIndexerUrl: undefined });
    await getMarketsData(env);

    expect(createLunarIndexerClient).not.toHaveBeenCalled();
  });
});

describe("onError callback", () => {
  test("calls onError with source and chainId when Lunar throws", async () => {
    const lunarError = new Error("Lunar unavailable");
    mockListMarkets.mockRejectedValue(lunarError);

    await getMarketsData(makeEnvironment());

    expect(mockOnError).toHaveBeenCalledWith(lunarError, {
      source: "markets",
      chainId: MOCK_CHAIN_ID,
    });
  });

  test("does not call onError when Lunar succeeds", async () => {
    mockListMarkets.mockResolvedValue({ results: [] });

    await getMarketsData(makeEnvironment());

    expect(mockOnError).not.toHaveBeenCalled();
  });

  test("does not call onError when lunarIndexerUrl is not set", async () => {
    const env = makeEnvironment({ lunarIndexerUrl: undefined });
    await getMarketsData(env);

    expect(mockOnError).not.toHaveBeenCalled();
  });
});

describe("RPC fallback after Lunar failure", () => {
  test("falls back to on-chain when Lunar throws", async () => {
    mockListMarkets.mockRejectedValue(new Error("Lunar down"));
    const mockGetAllMarketsInfo = vi.fn().mockResolvedValue([]);
    const env = makeEnvironment({
      contracts: {
        views: {
          read: {
            getProtocolInfo: vi
              .fn()
              .mockResolvedValue({ seizePaused: false, transferPaused: false }),
            getAllMarketsInfo: mockGetAllMarketsInfo,
            getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
            getGovernanceTokenPrice: vi.fn().mockResolvedValue(0n),
          },
        },
      } as unknown as Environment["contracts"],
    });

    await getMarketsData(env);

    expect(mockGetAllMarketsInfo).toHaveBeenCalled();
  });

  test("returns empty array when both Lunar and RPC return no markets", async () => {
    mockListMarkets.mockRejectedValue(new Error("Lunar down"));

    const result = await getMarketsData(makeEnvironment());

    expect(result).toEqual([]);
  });
});
