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
    const env = makeEnvironment({
      lunarIndexerUrl: undefined,
    } as unknown as Partial<Environment>);

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
    const env = makeEnvironment({
      lunarIndexerUrl: undefined,
    } as unknown as Partial<Environment>);

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

// Staking-reward prices used to be re-read sequentially for every vault, and a
// failure there only hit console.warn. They are now read once per environment
// and failures are reported through onError once per environment.
describe("staking rewards (includeRewards)", () => {
  const UNDERLYING = "0x00000000000000000000000000000000000000aa";
  const vaultKeys = ["vaultA", "vaultB", "vaultC"] as const;
  const vaultAddress = (i: number) =>
    `0x00000000000000000000000000000000000000b${i}`;

  const indexerVault = (address: string) => ({
    id: `99999-${address}`,
    chainId: 99999,
    address,
    name: "Vault",
    symbol: "VLT",
    decimals: 18,
    underlyingTokenAddress: UNDERLYING,
    underlyingToken: {
      id: "u",
      chainId: 99999,
      address: UNDERLYING,
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    initialOwner: "0x0",
    initialTimelock: "0",
    blockNumber: "0",
    timestamp: 0,
    totalSupply: "0",
    totalAssets: "0",
    totalAssetsUsd: "0",
    totalLiquidity: "0",
    totalLiquidityUsd: "0",
    underlyingPrice: "1",
    performanceFee: "0",
    timelock: "0",
    baseApy: "0",
    rewardsApy: "0",
    totalApy: "0",
    markets: [],
    rewards: [],
  });

  const makeRewardsEnvironment = (
    views: Record<string, ReturnType<typeof vi.fn>>,
    custom: Record<string, unknown> = {},
  ) =>
    makeEnvironment({
      // Unknown chainId: no public "home" environment, so every read stays on
      // the mocked views contract below.
      chainId: 99999,
      vaults: Object.fromEntries(vaultKeys.map((k) => [k, {}])),
      tokens: {},
      contracts: { views: { read: views } },
      custom,
      config: {
        vaults: Object.fromEntries(
          vaultKeys.map((k, i) => [
            k,
            { multiReward: vaultAddress(i + 5), vaultToken: k },
          ]),
        ),
        tokens: Object.fromEntries(
          vaultKeys.map((k, i) => [
            k,
            { address: vaultAddress(i), decimals: 18, symbol: k, name: k },
          ]),
        ),
        markets: {},
        morphoMarkets: {},
        contracts: {},
      },
    } as unknown as Partial<Environment>);

  beforeEach(() => {
    vi.mocked(fetchVaultsFromIndexer).mockResolvedValue({
      results: vaultKeys.map((_, i) => indexerVault(vaultAddress(i))),
      nextCursor: null,
    } as never);
  });

  test("reads reward prices once per environment, not once per vault", async () => {
    const views = {
      getAllMarketsInfo: vi.fn().mockResolvedValue([]),
      getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
      getGovernanceTokenPrice: vi.fn().mockResolvedValue(0n),
    };
    const env = makeRewardsEnvironment(views);

    const result = await getMorphoVaultsData({
      environments: [env],
      includeRewards: true,
    });

    expect(result).toHaveLength(3);
    expect(views.getAllMarketsInfo).toHaveBeenCalledTimes(1);
    expect(views.getNativeTokenPrice).toHaveBeenCalledTimes(1);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  test("reports a failed price read once per environment", async () => {
    const views = {
      getAllMarketsInfo: vi.fn().mockRejectedValue(new Error("multicall")),
      getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
      getGovernanceTokenPrice: vi.fn().mockResolvedValue(0n),
    };
    const env = makeRewardsEnvironment(views);

    const result = await getMorphoVaultsData({
      environments: [env],
      includeRewards: true,
    });

    expect(result).toHaveLength(3);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error), {
      source: "morpho-vault-staking-rewards",
      chainId: 99999,
      operation: "staking-reward-prices",
      failedCount: 3,
      totalCount: 3,
      items: ["vaultA", "vaultB", "vaultC"],
    });
  });

  test("reports per-vault reward failures once per environment", async () => {
    const views = {
      getAllMarketsInfo: vi.fn().mockResolvedValue([]),
      getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
      getGovernanceTokenPrice: vi.fn().mockResolvedValue(0n),
    };
    // A reward token missing from the environment makes getRewardsData throw
    // for every vault.
    const env = makeRewardsEnvironment(views, {
      multiRewarder: [{ rewardToken: "MISSING" }],
    });

    await getMorphoVaultsData({ environments: [env], includeRewards: true });

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(expect.any(TypeError), {
      source: "morpho-vault-staking-rewards",
      chainId: 99999,
      operation: "staking-rewards",
      failedCount: 3,
      totalCount: 3,
      items: ["vaultA", "vaultB", "vaultC"],
    });
  });
});

// Without a Lunar Indexer the vaults come from the on-chain views; that path
// reads the governance token price through the same shared helper.
describe("on-chain path governance token price", () => {
  test("reports a failed price read once for all vaults", async () => {
    const VAULT = "0x00000000000000000000000000000000000000e1";
    const onError = vi.fn();
    const env = makeEnvironment({
      // Own chainId so no other test's shared price read is reused.
      chainId: 99992,
      lunarIndexerUrl: undefined,
      onError,
      vaults: { vaultA: { address: VAULT } },
      contracts: {
        morphoViews: {
          read: {
            getVaultsInfo: vi.fn().mockResolvedValue([
              {
                vault: VAULT,
                totalSupply: 0n,
                totalAssets: 0n,
                underlyingPrice: 0n,
                fee: 0n,
                timelock: 0n,
                markets: [],
              },
            ]),
          },
        },
        views: {
          read: {
            getAllMarketsInfo: vi.fn().mockResolvedValue([]),
            getNativeTokenPrice: vi.fn().mockResolvedValue(0n),
            getGovernanceTokenPrice: vi
              .fn()
              .mockRejectedValue(new Error("multicall failed")),
          },
        },
      },
      config: {
        vaults: { vaultA: { underlyingToken: "USDC", vaultToken: "vaultA" } },
        tokens: {
          vaultA: { address: VAULT, decimals: 18, symbol: "vA", name: "vA" },
          USDC: {
            address: "0x00000000000000000000000000000000000000e2",
            decimals: 6,
            symbol: "USDC",
            name: "USDC",
          },
        },
        markets: {},
        morphoMarkets: {},
        contracts: {},
      },
    } as unknown as Partial<Environment>);
    // Keep the Morpho GraphQL rewards lookup off the network.
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    const result = await getMorphoVaultsData({
      environments: [env],
      includeRewards: true,
    });

    expect(result).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      source: "governance-token-price",
      chainId: 99992,
      operation: "governance-token-price-read",
      items: ["99992"],
    });
  });
});
