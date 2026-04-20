import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../../environments/index.js";
import { getMorphoVaultsData } from "./common.js";
import {
  fetchTokenMap,
  fetchVaultsFromIndexer,
} from "./lunarIndexerTransform.js";

vi.mock("./lunarIndexerTransform.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./lunarIndexerTransform.js")>();
  return {
    ...actual,
    fetchTokenMap: vi.fn(),
    fetchVaultsFromIndexer: vi.fn(),
  };
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_LUNAR_URL = "https://mock-vault-lunar.test";
const MOCK_CHAIN_ID = 8453;

const mockOnError = vi.fn();

/**
 * Minimal environment: has vaults (so the indexer filter passes) but no
 * morphoViews contract (so getMorphoVaultsDataFromOnChain returns [] without
 * making any RPC calls).
 */
function makeEnvironment(overrides: Partial<Environment> = {}): Environment {
  return {
    chainId: MOCK_CHAIN_ID,
    lunarIndexerUrl: MOCK_LUNAR_URL,
    onError: mockOnError,
    // Non-empty vaults so the filter `Object.keys(vaults).length > 0` passes
    vaults: {
      testVault: { address: "0x0000000000000000000000000000000000000001" },
    },
    contracts: {
      // Omitting morphoViews so getMorphoVaultsDataFromOnChain skips this env
    },
    config: {
      vaults: { testVault: {} },
      tokens: {},
      markets: {},
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
  vi.mocked(fetchTokenMap).mockResolvedValue(new Map() as never);
  vi.mocked(fetchVaultsFromIndexer).mockResolvedValue({
    results: [],
    nextCursor: null,
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("lunarIndexerUrl routing", () => {
  test("passes environment.lunarIndexerUrl to fetchVaultsFromIndexer", async () => {
    const env = makeEnvironment();

    await getMorphoVaultsData({ environments: [env] });

    expect(fetchVaultsFromIndexer).toHaveBeenCalledWith(
      MOCK_LUNAR_URL,
      MOCK_CHAIN_ID,
      undefined,
    );
  });

  test("passes environment.lunarIndexerUrl to fetchTokenMap", async () => {
    const env = makeEnvironment();

    await getMorphoVaultsData({ environments: [env] });

    expect(fetchTokenMap).toHaveBeenCalledWith(MOCK_LUNAR_URL, MOCK_CHAIN_ID);
  });

  test("skips Lunar Indexer when lunarIndexerUrl is not set", async () => {
    const env = makeEnvironment({ lunarIndexerUrl: undefined });

    await getMorphoVaultsData({ environments: [env] });

    expect(fetchVaultsFromIndexer).not.toHaveBeenCalled();
    expect(fetchTokenMap).not.toHaveBeenCalled();
  });
});

describe("onError callback", () => {
  test("calls onError with source and chainId when Lunar throws", async () => {
    const lunarError = new Error("Vault indexer unavailable");
    vi.mocked(fetchVaultsFromIndexer).mockRejectedValue(lunarError);

    const env = makeEnvironment();

    await getMorphoVaultsData({ environments: [env] });

    expect(mockOnError).toHaveBeenCalledWith(lunarError, {
      source: "vaults",
      chainId: MOCK_CHAIN_ID,
    });
  });

  test("does not call onError when Lunar succeeds", async () => {
    const env = makeEnvironment();

    await getMorphoVaultsData({ environments: [env] });

    expect(mockOnError).not.toHaveBeenCalled();
  });

  test("does not call onError when lunarIndexerUrl is not set", async () => {
    const env = makeEnvironment({ lunarIndexerUrl: undefined });

    await getMorphoVaultsData({ environments: [env] });

    expect(mockOnError).not.toHaveBeenCalled();
  });
});

describe("fallback after Lunar failure", () => {
  test("returns empty array when Lunar fails and no on-chain contracts configured", async () => {
    vi.mocked(fetchVaultsFromIndexer).mockRejectedValue(
      new Error("Indexer down"),
    );

    const env = makeEnvironment();
    const result = await getMorphoVaultsData({ environments: [env] });

    expect(result).toEqual([]);
  });
});
