import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Amount } from "../../../common/amount.js";
import { createEnvironment as createBaseEnvironment } from "../../../environments/definitions/base/environment.js";
import {
  fetchTokenMap,
  fetchVaultFromIndexer,
  fetchVaultSnapshotsFromIndexer,
  fetchVaultsFromIndexer,
  transformVaultFromIndexer,
  transformVaultSnapshotsFromIndexer,
  transformVaultsFromIndexer,
} from "./lunarIndexerTransform.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BASE_CHAIN_ID = 8453;
const LUNAR_INDEXER_URL = "https://lunar-services-worker.moonwell.workers.dev";

const MOCK_TOKENS = [
  {
    id: "8453-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    chainId: BASE_CHAIN_ID,
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    name: "Coinbase Wrapped BTC",
    symbol: "cbBTC",
    decimals: 8,
  },
  {
    id: "8453-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    chainId: BASE_CHAIN_ID,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  {
    id: "8453-0x4200000000000000000000000000000000000006",
    chainId: BASE_CHAIN_ID,
    address: "0x4200000000000000000000000000000000000006",
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
  },
  {
    id: "8453-0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
    chainId: BASE_CHAIN_ID,
    address: "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
    name: "Euro Coin",
    symbol: "EURC",
    decimals: 6,
  },
];

const CBBTC_UNDERLYING_TOKEN = MOCK_TOKENS[0];
const USDC_UNDERLYING_TOKEN = MOCK_TOKENS[1];
const WETH_UNDERLYING_TOKEN = MOCK_TOKENS[2];

// mwcbBTC — V1 Frontier vault (no version field in config → defaults to 1)
const MOCK_CBBTC_VAULT = {
  id: "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796",
  chainId: BASE_CHAIN_ID,
  address: "0x543257ef2161176d7c8cd90ba65c2d4caef5a796",
  name: "Moonwell Frontier cbBTC",
  symbol: "mwcbBTC",
  decimals: 18,
  underlyingTokenAddress: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "50.00000000",
  totalAssets: "50.00000000",
  totalAssetsUsd: "5000000.00",
  totalLiquidity: "10.00000000",
  totalLiquidityUsd: "1000000.00",
  underlyingPrice: "100000.00",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "3.5",
  rewardsApy: "1.2",
  totalApy: "4.7",
  markets: [
    {
      marketId: "0xabc123",
      marketCollateral: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
      marketCollateralName: "Coinbase Wrapped BTC",
      marketCollateralSymbol: "cbBTC",
      marketLiquidity: "5.00000000",
      marketLiquidityUsd: "500000.00",
      marketLltv: "0.86",
      marketApy: "3.5",
      vaultAllocation: "0.8",
      vaultSupplied: "40.00000000",
      vaultSuppliedUsd: "4000000.00",
    },
    {
      marketId: "0xdef456",
      marketCollateral: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
      marketCollateralName: "Coinbase Wrapped BTC",
      marketCollateralSymbol: "cbBTC",
      marketLiquidity: "5.00000000",
      marketLiquidityUsd: "500000.00",
      marketLltv: "0.77",
      marketApy: "2.8",
      vaultAllocation: "0.2",
      vaultSupplied: "10.00000000",
      vaultSuppliedUsd: "1000000.00",
    },
  ],
  rewards: [
    {
      token: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      tokenSymbol: "USDC",
      apr: "1.2",
    },
  ],
  underlyingToken: CBBTC_UNDERLYING_TOKEN,
};

// mwETH — no version field in config → defaults to 1
const MOCK_MWETH_VAULT = {
  id: "8453-0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1",
  chainId: BASE_CHAIN_ID,
  address: "0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1",
  name: "Moonwell Flagship ETH",
  symbol: "mwETH",
  decimals: 18,
  underlyingTokenAddress: "0x4200000000000000000000000000000000000006",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "1000.0",
  totalAssets: "1000.0",
  totalAssetsUsd: "3500000.00",
  totalLiquidity: "200.0",
  totalLiquidityUsd: "700000.00",
  underlyingPrice: "3500.00",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "4.1",
  rewardsApy: "0.5",
  totalApy: "4.6",
  markets: [],
  rewards: [],
  underlyingToken: WETH_UNDERLYING_TOKEN,
};

// mwUSDC — no version field in config → defaults to 1
const MOCK_MWUSDC_VAULT = {
  id: "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca",
  chainId: BASE_CHAIN_ID,
  address: "0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca",
  name: "Moonwell Flagship USDC",
  symbol: "mwUSDC",
  decimals: 18,
  underlyingTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "1000000.0",
  totalAssets: "1000000.0",
  totalAssetsUsd: "1000000.00",
  totalLiquidity: "200000.0",
  totalLiquidityUsd: "200000.00",
  underlyingPrice: "1.0001",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "5.2",
  rewardsApy: "0.0",
  totalApy: "5.2",
  markets: [],
  rewards: [],
  underlyingToken: USDC_UNDERLYING_TOKEN,
};

// mwEURC — no version field in config → defaults to 1
const MOCK_MWEURC_VAULT = {
  id: "8453-0xf24608e0ccb972b0b0f4a6446a0bbf58c701a026",
  chainId: BASE_CHAIN_ID,
  address: "0xf24608e0ccb972b0b0f4a6446a0bbf58c701a026",
  name: "Moonwell Flagship EURC",
  symbol: "mwEURC",
  decimals: 18,
  underlyingTokenAddress: "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "500000.0",
  totalAssets: "500000.0",
  totalAssetsUsd: "540000.00",
  totalLiquidity: "100000.0",
  totalLiquidityUsd: "108000.00",
  underlyingPrice: "1.08",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "3.8",
  rewardsApy: "0.0",
  totalApy: "3.8",
  markets: [],
  rewards: [],
  underlyingToken: MOCK_TOKENS[3],
};

// meUSDC — version: 2 (from config)
const MOCK_MEUSDC_VAULT = {
  id: "8453-0xbb2f06ceae42cbcf5559ed0713538c8892d977c9",
  chainId: BASE_CHAIN_ID,
  address: "0xbb2f06ceae42cbcf5559ed0713538c8892d977c9",
  name: "Moonwell Ecosystem USDC Vault",
  symbol: "meUSDC",
  decimals: 18,
  underlyingTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "2000000.0",
  totalAssets: "2000000.0",
  totalAssetsUsd: "2000000.00",
  totalLiquidity: "400000.0",
  totalLiquidityUsd: "400000.00",
  underlyingPrice: "1.0001",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "6.0",
  rewardsApy: "1.0",
  totalApy: "7.0",
  markets: [],
  rewards: [],
  underlyingToken: USDC_UNDERLYING_TOKEN,
};

// meUSDCv1 — no version field in config → defaults to 1
const MOCK_MEUSDCV1_VAULT = {
  id: "8453-0xe1ba476304255353aef290e6474a417d06e7b773",
  chainId: BASE_CHAIN_ID,
  address: "0xe1ba476304255353aef290e6474a417d06e7b773",
  // Indexer returns its own name; SDK config overrides with "Moonwell Ecosystem USDC Vault V1"
  name: "Moonwell Ecosystem USDC Vault",
  symbol: "meUSDCv1",
  decimals: 18,
  underlyingTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  initialOwner: "0x0000000000000000000000000000000000000001",
  initialTimelock: "604800",
  blockNumber: "12345678",
  timestamp: 1_700_000_000,
  totalSupply: "500000.0",
  totalAssets: "500000.0",
  totalAssetsUsd: "500000.00",
  totalLiquidity: "50000.0",
  totalLiquidityUsd: "50000.00",
  underlyingPrice: "1.0001",
  performanceFee: "15",
  timelock: "604800",
  baseApy: "5.0",
  rewardsApy: "2.0",
  totalApy: "7.0",
  markets: [],
  rewards: [],
  underlyingToken: USDC_UNDERLYING_TOKEN,
};

// Snapshot fixtures for mwUSDC vault
const MOCK_VAULT_SNAPSHOT_1 = {
  id: "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca-1700000000",
  chainId: BASE_CHAIN_ID,
  vaultAddress: "0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca",
  timestamp: 1_700_000_000,
  blockNumber: "12345678",
  totalSupply: "1000000",
  totalAssets: "1000000",
  totalAssetsUsd: "1000000.00",
  totalLiquidity: "200000",
  totalLiquidityUsd: "200000.00",
  underlyingPrice: "1.0001",
  vaultTokenPrice: "1.0",
  performanceFee: "15",
  baseApy: "5.2",
  timeInterval: 0,
};

const MOCK_VAULT_SNAPSHOT_2 = {
  ...MOCK_VAULT_SNAPSHOT_1,
  id: "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca-1699913600",
  timestamp: 1_699_913_600,
};

// All vaults in the expected config sort order
const ALL_MOCK_VAULTS = [
  MOCK_MWETH_VAULT,
  MOCK_MWUSDC_VAULT,
  MOCK_MWEURC_VAULT,
  MOCK_CBBTC_VAULT,
  MOCK_MEUSDC_VAULT,
  MOCK_MEUSDCV1_VAULT,
];

// ─── Mock fetch setup ─────────────────────────────────────────────────────────

function makeJsonResponse(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

function createMockFetch() {
  return vi.fn((url: string) => {
    // Snapshots endpoint (must come before single-vault check)
    if (url.includes("/snapshots")) {
      return makeJsonResponse({
        results: [MOCK_VAULT_SNAPSHOT_1, MOCK_VAULT_SNAPSHOT_2],
        nextCursor: null,
      });
    }

    // Tokens list
    if (url.includes("/api/v1/vaults/tokens/")) {
      return makeJsonResponse({ results: MOCK_TOKENS, nextCursor: null });
    }

    // Single vault endpoints
    if (url.includes("/api/v1/vaults/vault/8453-0x543257")) {
      return makeJsonResponse(MOCK_CBBTC_VAULT);
    }
    if (url.includes("/api/v1/vaults/vault/8453-0xa0e430")) {
      return makeJsonResponse(MOCK_MWETH_VAULT);
    }
    if (url.includes("/api/v1/vaults/vault/8453-0xc1256a")) {
      return makeJsonResponse(MOCK_MWUSDC_VAULT);
    }
    if (url.includes("/api/v1/vaults/vault/8453-0xe1ba47")) {
      return makeJsonResponse(MOCK_MEUSDCV1_VAULT);
    }
    if (url.includes("/api/v1/vaults/vault/8453-0xbb2f06")) {
      return makeJsonResponse(MOCK_MEUSDC_VAULT);
    }

    // Vaults list
    if (url.includes("/api/v1/vaults/vaults/")) {
      return makeJsonResponse({ results: ALL_MOCK_VAULTS, nextCursor: null });
    }

    return Promise.reject(new Error(`Unmocked URL: ${url}`));
  });
}

describe("Lunar Indexer Transformation Tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ─── Fetch function tests (mocked) ─────────────────────────────────────────

  test("Fetch tokens from Lunar Indexer", async () => {
    const tokenMap = await fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID);

    expect(tokenMap).toBeDefined();
    expect(tokenMap.size).toBeGreaterThan(0);

    const cbBTC = tokenMap.get(
      "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf".toLowerCase(),
    );
    expect(cbBTC).toBeDefined();
    expect(cbBTC?.symbol).toBe("cbBTC");
    expect(cbBTC?.decimals).toBe(8);

    const usdc = tokenMap.get(
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913".toLowerCase(),
    );
    expect(usdc).toBeDefined();
    expect(usdc?.symbol).toBe("USDC");
    expect(usdc?.decimals).toBe(6);
  });

  test("Fetch vaults from Lunar Indexer", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
    );

    expect(response).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    const vault = response.results[0];
    expect(vault.chainId).toBe(BASE_CHAIN_ID);
    expect(vault.address).toBeDefined();
    expect(vault.name).toBeDefined();
    expect(vault.symbol).toBeDefined();
    expect(vault.totalAssets).toBeDefined();
    expect(vault.baseApy).toBeDefined();
    expect(Array.isArray(vault.markets)).toBe(true);
  });

  test("Fetch vaults with includeRewards parameter", async () => {
    const response = await fetchVaultsFromIndexer(
      LUNAR_INDEXER_URL,
      BASE_CHAIN_ID,
      { includeRewards: true },
    );

    expect(response).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    response.results.forEach((vault) => {
      expect(vault.rewards).toBeDefined();
      expect(Array.isArray(vault.rewards)).toBe(true);
    });
  });

  test("Fetch single vault from Lunar Indexer", async () => {
    const vaultId = "8453-0x543257ef2161176d7c8cd90ba65c2d4caef5a796";
    const vault = await fetchVaultFromIndexer(LUNAR_INDEXER_URL, vaultId);

    expect(vault.chainId).toBe(BASE_CHAIN_ID);
    expect(vault.address).toBe("0x543257ef2161176d7c8cd90ba65c2d4caef5a796");
    expect(vault.symbol).toBe("mwcbBTC");
    expect(vault.underlyingToken).toBeDefined();
    expect(vault.underlyingToken?.symbol).toBe("cbBTC");
    expect(vault.underlyingToken?.decimals).toBe(8);
    expect(Array.isArray(vault.rewards)).toBe(true);
  });

  test("Fetch vault snapshots from Lunar Indexer", async () => {
    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const response = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    const snapshot = response.results[0];
    expect(snapshot.chainId).toBe(BASE_CHAIN_ID);
    expect(snapshot.vaultAddress).toBeDefined();
    expect(typeof snapshot.timestamp).toBe("number");
    expect(snapshot.totalAssets).toBeDefined();
    expect(snapshot.totalAssetsUsd).toBeDefined();
    expect(snapshot.totalLiquidity).toBeDefined();
    expect(typeof snapshot.timeInterval).toBe("number");
  });

  test("Fetch vault snapshots supports pagination via cursor", async () => {
    // Reconfigure mock: first call returns a cursor, second returns empty
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("cursor=")) {
        return makeJsonResponse({
          results: [MOCK_VAULT_SNAPSHOT_2],
          nextCursor: null,
        });
      }
      return makeJsonResponse({
        results: [MOCK_VAULT_SNAPSHOT_1],
        nextCursor: "1699913600",
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const vaultId = "8453-0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca";
    const firstPage = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
    );

    expect(firstPage.nextCursor).toBe("1699913600");

    const secondPage = await fetchVaultSnapshotsFromIndexer(
      LUNAR_INDEXER_URL,
      vaultId,
      { cursor: firstPage.nextCursor! },
    );

    expect(Array.isArray(secondPage.results)).toBe(true);
    // Second page timestamps should be older than first page
    if (firstPage.results.length > 0 && secondPage.results.length > 0) {
      expect(secondPage.results[0].timestamp).toBeLessThanOrEqual(
        firstPage.results[firstPage.results.length - 1].timestamp,
      );
    }
  });

  test("Fetch throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => makeJsonResponse({ error: "not found" }, 404)),
    );
    await expect(
      fetchTokenMap(LUNAR_INDEXER_URL, BASE_CHAIN_ID),
    ).rejects.toThrow("404");
  });

  // ─── Pure transformation unit tests ────────────────────────────────────────

  test("Transform single vault from indexer fixture", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_CBBTC_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vault.chainId).toBe(BASE_CHAIN_ID);
    expect(vault.vaultKey).toBe("mwcbBTC");
    expect(vault.version).toBe(1);
    expect(typeof vault.deprecated).toBe("boolean");

    expect(vault.vaultToken.address.toLowerCase()).toBe(
      MOCK_CBBTC_VAULT.address.toLowerCase(),
    );
    expect(vault.vaultToken.symbol).toBe("mwcbBTC");
    expect(vault.vaultToken.decimals).toBe(18);

    // SDK config overrides: mwcbBTC underlyingToken is "cbBTC" from config
    expect(vault.underlyingToken.symbol).toBe("cbBTC");
    expect(vault.underlyingToken.decimals).toBe(8);

    expect(vault.totalSupply).toBeInstanceOf(Amount);
    expect(vault.totalSupply.value).toBeCloseTo(50, 6);
    expect(vault.totalSupply.base).toBe(8); // cbBTC decimals

    expect(vault.totalLiquidity).toBeInstanceOf(Amount);
    expect(vault.vaultSupply).toBeInstanceOf(Amount);
    expect(vault.vaultSupply.value).toBeGreaterThanOrEqual(0); // must never be negative

    expect(typeof vault.totalSupplyUsd).toBe("number");
    expect(vault.totalSupplyUsd).toBeCloseTo(5_000_000, 0);
    expect(typeof vault.underlyingPrice).toBe("number");
    expect(vault.underlyingPrice).toBeCloseTo(100_000, 0);
    expect(typeof vault.baseApy).toBe("number");
    expect(typeof vault.totalApy).toBe("number");

    expect(Array.isArray(vault.markets)).toBe(true);
    expect(Array.isArray(vault.rewards)).toBe(true);
    expect(Array.isArray(vault.stakingRewards)).toBe(true);
    expect(Array.isArray(vault.curators)).toBe(true);
  });

  test("Transform multiple vaults from indexer fixtures", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vaults = transformVaultsFromIndexer(
      ALL_MOCK_VAULTS,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vaults.length).toBe(ALL_MOCK_VAULTS.length);
    for (const vault of vaults) {
      expect(vault.chainId).toBe(BASE_CHAIN_ID);
      expect(vault.vaultKey).toBeDefined();
      expect(vault.vaultToken).toBeDefined();
      expect(vault.underlyingToken).toBeDefined();
      expect(vault.totalSupply).toBeInstanceOf(Amount);
      expect(vault.totalLiquidity).toBeInstanceOf(Amount);
      expect(vault.vaultSupply).toBeInstanceOf(Amount);
      expect(vault.vaultSupply.value).toBeGreaterThanOrEqual(0);
      expect(typeof vault.baseApy).toBe("number");
      expect(Array.isArray(vault.markets)).toBe(true);
    }
  });

  test("Transformed vault has all required MorphoVault fields", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );
    const vault = transformVaultFromIndexer(
      MOCK_CBBTC_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    const required = [
      "chainId",
      "vaultKey",
      "version",
      "deprecated",
      "vaultToken",
      "underlyingToken",
      "vaultSupply",
      "totalSupply",
      "totalSupplyUsd",
      "totalLiquidity",
      "totalLiquidityUsd",
      "totalStaked",
      "totalStakedUsd",
      "underlyingPrice",
      "baseApy",
      "rewardsApy",
      "totalApy",
      "stakingRewardsApr",
      "totalStakingApr",
      "performanceFee",
      "curators",
      "timelock",
      "markets",
      "rewards",
      "stakingRewards",
    ];
    for (const field of required) {
      expect(vault, `missing field: ${field}`).toHaveProperty(field);
    }
  });

  test("Amount conversions match indexer data", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_CBBTC_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vault.totalSupply.value).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.totalAssets),
      6,
    );
    expect(vault.totalLiquidity.value).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.totalLiquidity),
      6,
    );
    expect(vault.vaultSupply.value).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.totalAssets) -
        Number.parseFloat(MOCK_CBBTC_VAULT.totalLiquidity),
      6,
    );
    expect(vault.underlyingPrice).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.underlyingPrice),
      2,
    );
    expect(vault.baseApy).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.baseApy),
      10,
    );
    expect(vault.rewardsApy).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.rewardsApy),
      10,
    );
    expect(vault.totalApy).toBeCloseTo(
      Number.parseFloat(MOCK_CBBTC_VAULT.totalApy),
      10,
    );
  });

  test("Performance fee converted from percentage to decimal (0-100 → 0-1)", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vaults = transformVaultsFromIndexer(
      ALL_MOCK_VAULTS,
      createBaseEnvironment(),
      tokenMap,
    );

    vaults.forEach((vault, i) => {
      const expectedFee =
        Number.parseFloat(ALL_MOCK_VAULTS[i].performanceFee) / 100;
      expect(vault.performanceFee).toBeCloseTo(expectedFee, 10);
      expect(vault.performanceFee).toBeGreaterThanOrEqual(0);
      expect(vault.performanceFee).toBeLessThanOrEqual(1);
    });
  });

  test("Timelock converted from seconds to hours", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vaults = transformVaultsFromIndexer(
      ALL_MOCK_VAULTS,
      createBaseEnvironment(),
      tokenMap,
    );

    vaults.forEach((vault, i) => {
      const expectedHours =
        Number.parseInt(ALL_MOCK_VAULTS[i].timelock) / (60 * 60);
      expect(vault.timelock).toBe(expectedHours);
    });
  });

  test("Market allocations calculated correctly", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_CBBTC_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    const totalAssets = Number.parseFloat(MOCK_CBBTC_VAULT.totalAssets);

    vault.markets.forEach((market, i) => {
      const vaultSupplied = Number.parseFloat(
        MOCK_CBBTC_VAULT.markets[i].vaultSupplied,
      );
      const expected = totalAssets > 0 ? vaultSupplied / totalAssets : 0;
      expect(market.allocation).toBeCloseTo(expected, 10);
      expect(market.allocation).toBeGreaterThanOrEqual(0);
      expect(market.allocation).toBeLessThanOrEqual(1);
    });

    const total = vault.markets.reduce((sum, m) => sum + m.allocation, 0);
    if (vault.markets.length > 0 && totalAssets > 0) {
      expect(total).toBeLessThanOrEqual(1.01); // Allow small floating-point error
    }
  });

  test("V2 vault detected from config version field (only meUSDC is V2)", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vaults = transformVaultsFromIndexer(
      ALL_MOCK_VAULTS,
      createBaseEnvironment(),
      tokenMap,
    );

    // Only meUSDC has version:2 in config; everything else defaults to 1
    const meUSDC = vaults.find((v) => v.vaultKey === "meUSDC");
    expect(meUSDC?.version).toBe(2);

    const v1Keys = ["mwETH", "mwUSDC", "mwEURC", "mwcbBTC", "meUSDCv1"];
    for (const key of v1Keys) {
      const vault = vaults.find((v) => v.vaultKey === key);
      expect(vault?.version, `${key} should be V1`).toBe(1);
    }
  });

  test("mwETH vault uses ETH (not WETH) as underlying token from SDK config", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_MWETH_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    // SDK config maps mwETH → underlyingToken: "ETH"
    expect(vault.underlyingToken.symbol).toBe("ETH");
    expect(vault.underlyingToken.name).toBe("Ethereum");
    expect(vault.vaultKey).toBe("mwETH");
  });

  test("meUSDCv1 vault name comes from SDK config, not indexer", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_MEUSDCV1_VAULT,
      createBaseEnvironment(),
      tokenMap,
    );

    // SDK config has name "Moonwell Ecosystem USDC Vault V1"
    expect(vault.vaultToken.name).toBe("Moonwell Ecosystem USDC Vault V1");
    expect(vault.vaultToken.symbol).toBe("meUSDCv1");
    expect(vault.vaultKey).toBe("meUSDCv1");
  });

  test("Vaults sorted by config key order: mwETH, mwUSDC, mwEURC, mwcbBTC, meUSDC, meUSDCv1", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );
    const environment = createBaseEnvironment();

    const vaults = transformVaultsFromIndexer(
      ALL_MOCK_VAULTS,
      environment,
      tokenMap,
    );

    // Apply same sort used in getMorphoVaultsDataFromIndexer
    const order = Object.keys(environment.config.vaults);
    vaults.sort((a, b) => {
      const ai = order.indexOf(a.vaultKey);
      const bi = order.indexOf(b.vaultKey);
      return (
        (ai === -1 ? Number.POSITIVE_INFINITY : ai) -
        (bi === -1 ? Number.POSITIVE_INFINITY : bi)
      );
    });

    const expectedOrder = [
      "mwETH",
      "mwUSDC",
      "mwEURC",
      "mwcbBTC",
      "meUSDC",
      "meUSDCv1",
    ];
    const known = vaults.filter((v) => expectedOrder.includes(v.vaultKey));
    expect(known.map((v) => v.vaultKey)).toEqual(expectedOrder);
  });

  // ─── Edge case unit tests ───────────────────────────────────────────────────

  test("Missing underlying token throws", () => {
    const { underlyingToken: _, ...vaultWithoutToken } = MOCK_CBBTC_VAULT;
    expect(() =>
      transformVaultFromIndexer(
        vaultWithoutToken,
        createBaseEnvironment(),
        new Map(), // empty map → token not found
      ),
    ).toThrow("Underlying token not found");
  });

  test("vaultSupply is never negative when totalLiquidity > totalAssets", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vaultWithHighLiquidity = {
      ...MOCK_CBBTC_VAULT,
      totalAssets: "10.0",
      totalLiquidity: "50.0", // liquidity > assets → would be negative without guard
    };

    const vault = transformVaultFromIndexer(
      vaultWithHighLiquidity,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vault.vaultSupply.value).toBe(0);
  });

  test("Zero totalAssets results in zero allocation for all markets", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const emptyVault = {
      ...MOCK_CBBTC_VAULT,
      totalAssets: "0",
      totalLiquidity: "0",
    };

    const vault = transformVaultFromIndexer(
      emptyVault,
      createBaseEnvironment(),
      tokenMap,
    );

    for (const market of vault.markets) {
      expect(market.allocation).toBe(0);
    }
  });

  test("Vault with no markets transforms cleanly", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const vault = transformVaultFromIndexer(
      MOCK_MWETH_VAULT, // has markets: []
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vault.markets).toEqual([]);
  });

  test("Unknown vault address uses indexer name/symbol and defaults to V1", () => {
    const tokenMap = new Map(
      MOCK_TOKENS.map((t) => [t.address.toLowerCase(), t]),
    );

    const unknownVault = {
      ...MOCK_CBBTC_VAULT,
      address: "0x1111111111111111111111111111111111111111",
      name: "Some Unknown Vault",
      symbol: "SUV",
    };

    const vault = transformVaultFromIndexer(
      unknownVault,
      createBaseEnvironment(),
      tokenMap,
    );

    expect(vault.version).toBe(1);
    expect(vault.vaultToken.symbol).toBe("SUV");
    expect(vault.deprecated).toBe(false);
  });

  // ─── Snapshot transformation tests ─────────────────────────────────────────

  test("Transform vault snapshots from indexer fixtures", () => {
    const snapshots = [MOCK_VAULT_SNAPSHOT_1, MOCK_VAULT_SNAPSHOT_2];
    const transformed = transformVaultSnapshotsFromIndexer(
      snapshots,
      BASE_CHAIN_ID,
    );

    expect(transformed.length).toBe(snapshots.length);

    transformed.forEach((snap, i) => {
      const raw = snapshots[i];

      expect(snap.chainId).toBe(BASE_CHAIN_ID);
      expect(snap.vaultAddress).toBe(raw.vaultAddress.toLowerCase());
      expect(snap.timestamp).toBe(raw.timestamp * 1000); // unix → ms

      expect(snap.totalSupply).toBeCloseTo(
        Number.parseFloat(raw.totalAssets),
        6,
      );
      expect(snap.totalSupplyUsd).toBeCloseTo(
        Number.parseFloat(raw.totalAssetsUsd),
        6,
      );
      expect(snap.totalLiquidity).toBeCloseTo(
        Number.parseFloat(raw.totalLiquidity),
        6,
      );
      expect(snap.totalLiquidityUsd).toBeCloseTo(
        Number.parseFloat(raw.totalLiquidityUsd),
        6,
      );

      const expectedBorrows =
        Number.parseFloat(raw.totalAssets) -
        Number.parseFloat(raw.totalLiquidity);
      expect(snap.totalBorrows).toBeCloseTo(expectedBorrows, 6);

      const expectedBorrowsUsd =
        Number.parseFloat(raw.totalAssetsUsd) -
        Number.parseFloat(raw.totalLiquidityUsd);
      expect(snap.totalBorrowsUsd).toBeCloseTo(expectedBorrowsUsd, 6);
    });
  });

  test("Transformed snapshots have all required MorphoVaultSnapshot fields", () => {
    const transformed = transformVaultSnapshotsFromIndexer(
      [MOCK_VAULT_SNAPSHOT_1],
      BASE_CHAIN_ID,
    );

    expect(transformed.length).toBe(1);
    const snap = transformed[0];

    const required = [
      "chainId",
      "vaultAddress",
      "totalSupply",
      "totalSupplyUsd",
      "totalBorrows",
      "totalBorrowsUsd",
      "totalLiquidity",
      "totalLiquidityUsd",
      "timestamp",
    ];
    for (const field of required) {
      expect(snap, `missing field: ${field}`).toHaveProperty(field);
    }

    expect(typeof snap.totalSupply).toBe("number");
    expect(typeof snap.totalSupplyUsd).toBe("number");
    expect(typeof snap.totalBorrows).toBe("number");
    expect(typeof snap.totalBorrowsUsd).toBe("number");
    expect(typeof snap.totalLiquidity).toBe("number");
    expect(typeof snap.totalLiquidityUsd).toBe("number");
    expect(typeof snap.timestamp).toBe("number");
  });
});
