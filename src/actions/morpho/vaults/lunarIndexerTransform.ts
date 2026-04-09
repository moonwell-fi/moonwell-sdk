/**
 * Lunar Indexer Response Transformation Utilities
 *
 * This module provides transformation functions to convert Lunar Indexer API responses
 * into SDK MorphoVault types. The indexer returns string values that need to be converted
 * to proper numeric types and Amount objects.
 *
 * @module morpho/vaults/lunarIndexerTransform
 */

import { Amount } from "../../../common/amount.js";
import type { Environment, TokenConfig } from "../../../environments/index.js";
import type {
  MorphoVault,
  MorphoVaultMarket,
  MorphoVaultSnapshot,
} from "../../../types/morphoVault.js";

/**
 * Lunar Indexer API Response Types
 * These match the structure returned by the Lunar Indexer endpoints
 */

export type LunarIndexerToken = {
  id: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type LunarIndexerMarket = {
  marketId: string;
  marketCollateral: string;
  marketCollateralName: string;
  marketCollateralSymbol: string;
  marketLiquidity: string;
  marketLiquidityUsd: string;
  marketLltv: string;
  marketApy: string;
  vaultAllocation: string;
  vaultSupplied: string;
  vaultSuppliedUsd: string;
};

export type LunarIndexerReward = {
  token: string;
  tokenSymbol: string;
  apr: string;
};

export type LunarIndexerVault = {
  id: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  underlyingTokenAddress: string;
  initialOwner: string;
  initialTimelock: string;
  blockNumber: string;
  timestamp: number;
  totalSupply: string;
  totalAssets: string;
  totalAssetsUsd: string;
  totalLiquidity: string;
  totalLiquidityUsd: string;
  underlyingPrice: string;
  performanceFee: string;
  timelock: string;
  baseApy: string;
  rewardsApy: string;
  totalApy: string;
  markets: LunarIndexerMarket[];
  rewards: LunarIndexerReward[];
  curators?: string[]; // Optional - to be added by indexer team
  underlyingToken?: LunarIndexerToken; // Only populated in single vault endpoint
};

export type LunarIndexerVaultsResponse = {
  results: LunarIndexerVault[];
  nextCursor: string | null;
};

export type LunarIndexerTokensResponse = {
  results: LunarIndexerToken[];
  nextCursor: string | null;
};

/**
 * Build a TokenConfig from Lunar Indexer token data
 */
function buildTokenConfig(token: LunarIndexerToken): TokenConfig {
  return {
    address: token.address as `0x${string}`,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
  };
}

/**
 * Build a TokenConfig from vault data (for the vault token itself)
 */
function buildVaultTokenConfig(vault: LunarIndexerVault): TokenConfig {
  return {
    address: vault.address as `0x${string}`,
    symbol: vault.symbol,
    name: vault.name,
    decimals: vault.decimals,
  };
}

/**
 * Transform a single market from Lunar Indexer format to SDK format
 */
function transformMarket(
  market: LunarIndexerMarket,
  underlyingDecimals: number,
  totalAssets: number,
  tokenMap: Map<string, LunarIndexerToken>,
): MorphoVaultMarket {
  // Get collateral token info from map
  const collateralToken = tokenMap.get(market.marketCollateral.toLowerCase());

  const vaultSupplied = Number.parseFloat(market.vaultSupplied);
  const allocation = totalAssets > 0 ? vaultSupplied / totalAssets : 0;

  return {
    marketId: market.marketId,
    allocation,
    marketApy: Number.parseFloat(market.marketApy),
    marketLoanToValue: Number.parseFloat(market.marketLltv),
    marketCollateral: collateralToken
      ? buildTokenConfig(collateralToken)
      : {
          // Fallback if token not in map
          address: market.marketCollateral as `0x${string}`,
          symbol: market.marketCollateralSymbol,
          name: market.marketCollateralName,
          decimals: 18, // Default fallback - should be populated by indexer
        },
    marketLiquidity: new Amount(
      Number.parseFloat(market.marketLiquidity),
      underlyingDecimals,
    ),
    marketLiquidityUsd: Number.parseFloat(market.marketLiquidityUsd),
    totalSupplied: new Amount(vaultSupplied, underlyingDecimals),
    totalSuppliedUsd: Number.parseFloat(market.vaultSuppliedUsd),
    rewards: [], // Rewards are at vault level, not market level in indexer response
  };
}

/**
 * Transform rewards from Lunar Indexer format to SDK format
 */
function transformRewards(
  rewards: LunarIndexerReward[],
  tokenMap: Map<string, LunarIndexerToken>,
) {
  return rewards.map((reward) => {
    const token = tokenMap.get(reward.token.toLowerCase());

    return {
      asset: token
        ? buildTokenConfig(token)
        : {
            address: reward.token as `0x${string}`,
            symbol: reward.tokenSymbol,
            name: reward.tokenSymbol,
            decimals: 18, // Default fallback
          },
      supplyApr: Number.parseFloat(reward.apr),
      supplyAmount: 0, // Not provided by indexer
      borrowApr: 0,
      borrowAmount: 0,
    };
  });
}

/**
 * Find vault configuration from environment by address
 */
function findVaultConfigByAddress(environment: Environment, address: string) {
  const vaultKey = Object.keys(environment.config.vaults).find(
    (key) =>
      environment.config.tokens[key]?.address.toLowerCase() ===
      address.toLowerCase(),
  );

  return {
    key: vaultKey,
    config: vaultKey ? environment.config.vaults[vaultKey] : undefined,
  };
}

/**
 * Transform a single vault from Lunar Indexer format to SDK MorphoVault format
 *
 * @param indexerVault - Vault data from Lunar Indexer
 * @param environment - SDK environment for this chain
 * @param tokenMap - Map of token addresses to token data for lookups
 * @returns Transformed MorphoVault object
 */
export function transformVaultFromIndexer(
  indexerVault: LunarIndexerVault,
  environment: Environment,
  tokenMap: Map<string, LunarIndexerToken>,
): MorphoVault {
  // Get underlying token info
  const underlyingToken =
    indexerVault.underlyingToken ||
    tokenMap.get(indexerVault.underlyingTokenAddress.toLowerCase());

  if (!underlyingToken) {
    throw new Error(
      `Underlying token not found: ${indexerVault.underlyingTokenAddress}`,
    );
  }

  const underlyingDecimals = underlyingToken.decimals;

  // Find vault config from environment
  const { key: vaultKey, config: vaultConfig } = findVaultConfigByAddress(
    environment,
    indexerVault.address,
  );

  // Resolve SDK token configs (preferred over API data for known vaults)
  const sdkVaultTokenConfig = vaultConfig
    ? environment.config.tokens[vaultConfig.vaultToken as string]
    : undefined;
  const sdkUnderlyingTokenConfig = vaultConfig
    ? environment.config.tokens[vaultConfig.underlyingToken as string]
    : undefined;

  // Determine version from config; unknown vaults default to V1
  const version = vaultConfig?.version ?? 1;

  // Parse numeric values
  const totalAssetsValue = Number.parseFloat(indexerVault.totalAssets);
  const totalLiquidityValue = Number.parseFloat(indexerVault.totalLiquidity);

  // Calculate vault supply (total assets deployed, not in liquidity).
  // Guard against negative values in case of transient data inconsistency
  // where totalLiquidity briefly exceeds totalAssets.
  const vaultSupplyValue = Math.max(0, totalAssetsValue - totalLiquidityValue);

  // Transform markets
  const markets = indexerVault.markets.map((market) =>
    transformMarket(market, underlyingDecimals, totalAssetsValue, tokenMap),
  );

  // Transform rewards
  const rewards = transformRewards(indexerVault.rewards, tokenMap);

  // Build vault object
  const vault: MorphoVault = {
    chainId: indexerVault.chainId,
    vaultKey: vaultKey || `unknown_${indexerVault.address}`,
    version,
    deprecated: vaultConfig?.deprecated ?? false,

    vaultToken: sdkVaultTokenConfig ?? buildVaultTokenConfig(indexerVault),
    underlyingToken:
      sdkUnderlyingTokenConfig ?? buildTokenConfig(underlyingToken),

    totalSupply: new Amount(totalAssetsValue, underlyingDecimals),
    totalLiquidity: new Amount(totalLiquidityValue, underlyingDecimals),
    vaultSupply: new Amount(vaultSupplyValue, underlyingDecimals),

    totalSupplyUsd: Number.parseFloat(indexerVault.totalAssetsUsd),
    totalLiquidityUsd: Number.parseFloat(indexerVault.totalLiquidityUsd),

    underlyingPrice: Number.parseFloat(indexerVault.underlyingPrice),
    baseApy: Number.parseFloat(indexerVault.baseApy),
    rewardsApy: Number.parseFloat(indexerVault.rewardsApy),
    totalApy: Number.parseFloat(indexerVault.totalApy),

    // Indexer returns performanceFee as a percentage string (e.g. "15" = 15%).
    // SDK consumers expect a 0-1 fraction, so divide by 100.
    // If the indexer ever changes to return 0-1 directly, remove the division.
    performanceFee: Number.parseFloat(indexerVault.performanceFee) / 100,
    timelock: Number.parseInt(indexerVault.timelock) / (60 * 60), // Convert seconds to hours
    curators: indexerVault.curators || [], // Will be populated by indexer or empty

    markets,
    rewards,

    // Staking fields (will be populated separately if multiReward configured)
    totalStaked: new Amount(0n, underlyingDecimals),
    totalStakedUsd: 0,
    stakingRewardsApr: 0,
    totalStakingApr: Number.parseFloat(indexerVault.baseApy), // Initially same as baseApy
    stakingRewards: [],
  };

  return vault;
}

/**
 * Transform multiple vaults from Lunar Indexer format
 *
 * @param indexerVaults - Array of vault data from Lunar Indexer
 * @param environment - SDK environment for this chain
 * @param tokenMap - Map of token addresses to token data for lookups
 * @returns Array of transformed MorphoVault objects
 */
export function transformVaultsFromIndexer(
  indexerVaults: LunarIndexerVault[],
  environment: Environment,
  tokenMap: Map<string, LunarIndexerToken>,
): MorphoVault[] {
  return indexerVaults.map((vault) =>
    transformVaultFromIndexer(vault, environment, tokenMap),
  );
}

/**
 * Fetch tokens from Lunar Indexer and create a lookup map
 *
 * @param lunarIndexerUrl - Base URL for Lunar Indexer API
 * @param chainId - Chain ID to fetch tokens for
 * @returns Map of token address (lowercase) to token data
 */
export async function fetchTokenMap(
  lunarIndexerUrl: string,
  chainId: number,
): Promise<Map<string, LunarIndexerToken>> {
  const url = `${lunarIndexerUrl}/api/v1/vaults/tokens/${chainId}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tokens from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  const data: LunarIndexerTokensResponse = await response.json();

  const tokenMap = new Map<string, LunarIndexerToken>();
  for (const token of data.results) {
    tokenMap.set(token.address.toLowerCase(), token);
  }

  return tokenMap;
}

/**
 * Fetch vaults from Lunar Indexer
 *
 * @param lunarIndexerUrl - Base URL for Lunar Indexer API
 * @param chainId - Chain ID to fetch vaults for
 * @param options - Optional query parameters
 * @returns Lunar Indexer vaults response
 */
export async function fetchVaultsFromIndexer(
  lunarIndexerUrl: string,
  chainId: number,
  options?: {
    limit?: number;
    cursor?: string;
    includeRewards?: boolean;
  },
): Promise<LunarIndexerVaultsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.includeRewards) params.set("includeRewards", "true");

  const url = `${lunarIndexerUrl}/api/v1/vaults/vaults/${chainId}${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vaults from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch single vault from Lunar Indexer
 *
 * @param lunarIndexerUrl - Base URL for Lunar Indexer API
 * @param vaultId - Vault ID in format "chainId-address"
 * @returns Single vault data with underlyingToken populated
 */
export async function fetchVaultFromIndexer(
  lunarIndexerUrl: string,
  vaultId: string,
): Promise<LunarIndexerVault> {
  const url = `${lunarIndexerUrl}/api/v1/vaults/vault/${vaultId}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vault from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Lunar Indexer Vault Snapshot Types
 */

export type LunarIndexerVaultSnapshot = {
  id: string;
  chainId: number;
  vaultAddress: string;
  timestamp: number;
  blockNumber: string;
  totalSupply: string;
  totalAssets: string;
  totalAssetsUsd: string;
  totalLiquidity: string;
  totalLiquidityUsd: string;
  underlyingPrice: string;
  vaultTokenPrice: string;
  performanceFee: string;
  baseApy: string;
  timeInterval: number;
};

export type LunarIndexerVaultSnapshotsResponse = {
  results: LunarIndexerVaultSnapshot[];
  nextCursor: string | null;
};

/**
 * Fetch vault snapshots from Lunar Indexer
 *
 * @param lunarIndexerUrl - Base URL for Lunar Indexer API
 * @param vaultId - Vault ID in format "chainId-address"
 * @param options - Optional query parameters
 * @returns Lunar Indexer vault snapshots response
 */
export async function fetchVaultSnapshotsFromIndexer(
  lunarIndexerUrl: string,
  vaultId: string,
  options?: {
    cursor?: string;
    limit?: number;
    granularity?: string;
    startTime?: number;
    endTime?: number;
  },
): Promise<LunarIndexerVaultSnapshotsResponse> {
  const params = new URLSearchParams();
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.granularity) params.set("granularity", options.granularity);
  if (options?.startTime) params.set("startTime", options.startTime.toString());
  if (options?.endTime) params.set("endTime", options.endTime.toString());

  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/vaults/vault/${vaultId}/snapshots${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vault snapshots from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Transform vault snapshots from Lunar Indexer format to SDK MorphoVaultSnapshot format
 *
 * @param snapshots - Array of snapshot data from Lunar Indexer
 * @param chainId - Chain ID for the snapshots
 * @returns Array of transformed MorphoVaultSnapshot objects
 */
/**
 * Returns the V1 vault key paired with a given vault, or undefined if the vault
 * has no V1 pair (i.e. it is already a V1 vault or has no v1VaultKey configured).
 */
export function getV1VaultKey(
  environment: Environment,
  vaultKey: string,
): string | undefined {
  const rawKey = environment.config.vaults[vaultKey]?.v1VaultKey;
  return typeof rawKey === "string" ? rawKey : undefined;
}

export function transformVaultSnapshotsFromIndexer(
  snapshots: LunarIndexerVaultSnapshot[],
  chainId: number,
): MorphoVaultSnapshot[] {
  return snapshots.map((snapshot) => {
    const totalAssets = Number.parseFloat(snapshot.totalAssets);
    const totalAssetsUsd = Number.parseFloat(snapshot.totalAssetsUsd);
    const totalLiquidity = Number.parseFloat(snapshot.totalLiquidity);
    const totalLiquidityUsd = Number.parseFloat(snapshot.totalLiquidityUsd);

    return {
      chainId,
      vaultAddress: snapshot.vaultAddress.toLowerCase(),
      totalSupply: totalAssets,
      totalSupplyUsd: totalAssetsUsd,
      totalBorrows: totalAssets - totalLiquidity,
      totalBorrowsUsd: totalAssetsUsd - totalLiquidityUsd,
      totalLiquidity,
      totalLiquidityUsd,
      timestamp: snapshot.timestamp * 1000,
    };
  });
}
