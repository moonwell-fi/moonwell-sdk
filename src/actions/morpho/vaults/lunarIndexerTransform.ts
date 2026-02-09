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
 * Helper to check if a vault is V2 based on known V2 vault addresses
 * This should match the logic from @lunar-services/shared or be imported from there
 */
function isV2Vault(chainId: number, address: string): boolean {
  const v2Vaults: Record<number, string[]> = {
    8453: [
      // Base
      "0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1", // mwETH
      "0xc1256ae5ff1cf2719d4937adb3bbccab2e00a2ca", // mwUSDC
      "0xf24608e0ccb972b0b0f4a6446a0bbf58c701a026", // mwEURC
    ],
    10: [
      // Optimism
      "0x97e16db82e089d0c9c37bc07f23f42ec3be2ad84", // mwUSDC
    ],
  };

  return (
    v2Vaults[chainId]?.some(
      (addr) => addr.toLowerCase() === address.toLowerCase(),
    ) ?? false
  );
}

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

  // Determine version
  const version =
    vaultConfig?.version ||
    (isV2Vault(indexerVault.chainId, indexerVault.address) ? 2 : 1);

  // Parse numeric values
  const totalAssetsValue = Number.parseFloat(indexerVault.totalAssets);
  const totalLiquidityValue = Number.parseFloat(indexerVault.totalLiquidity);

  // Calculate vault supply (total assets deployed, not in liquidity)
  const vaultSupplyValue = totalAssetsValue - totalLiquidityValue;

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

    vaultToken: buildVaultTokenConfig(indexerVault),
    underlyingToken: buildTokenConfig(underlyingToken),

    totalSupply: new Amount(totalAssetsValue, underlyingDecimals),
    totalLiquidity: new Amount(totalLiquidityValue, underlyingDecimals),
    vaultSupply: new Amount(vaultSupplyValue, underlyingDecimals),

    totalSupplyUsd: Number.parseFloat(indexerVault.totalAssetsUsd),
    totalLiquidityUsd: Number.parseFloat(indexerVault.totalLiquidityUsd),

    underlyingPrice: Number.parseFloat(indexerVault.underlyingPrice),
    baseApy: Number.parseFloat(indexerVault.baseApy),
    rewardsApy: Number.parseFloat(indexerVault.rewardsApy),
    totalApy: Number.parseFloat(indexerVault.totalApy),

    performanceFee: Number.parseFloat(indexerVault.performanceFee) / 100, // Convert from 0-100 to 0-1
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
  const url = `${lunarIndexerUrl}/tokens/${chainId}`;

  const response = await fetch(url);

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

  const url = `${lunarIndexerUrl}/vaults/${chainId}${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url);

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
  const url = `${lunarIndexerUrl}/vault/${vaultId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vault from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
