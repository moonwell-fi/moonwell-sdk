/**
 * Lunar Indexer Response Transformation Utilities for Morpho Markets
 *
 * This module provides transformation functions to convert Lunar Indexer API responses
 * into SDK MorphoMarket types. The indexer returns string values that need to be converted
 * to proper numeric types and Amount objects.
 *
 * @module morpho/markets/lunarIndexerTransform
 */

import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { Environment } from "../../../environments/index.js";
import type {
  MorphoMarket,
  MorphoMarketParamsType,
  PublicAllocatorSharedLiquidityType,
} from "../../../types/morphoMarket.js";
import type { MorphoReward } from "../../../types/morphoReward.js";

/**
 * Lunar Indexer API Response Types
 * These match the structure returned by the Lunar Indexer endpoints
 */

export type LunarIndexerToken = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type LunarIndexerMarket = {
  marketId: string;
  chainId: number;
  totalSupplyAssets: string;
  totalBorrowAssets: string;
  totalLiquidity: string;
  totalSupplyAssetsUsd: string;
  totalBorrowAssetsUsd: string;
  totalLiquidityUsd: string;
  loanTokenPrice: string;
  collateralTokenPrice: string;
  supplyApy: string;
  borrowApy: string;
  lltv: string;
  fee: string;
  oracle: string;
  irm: string;
  loanToken: LunarIndexerToken;
  collateralToken: LunarIndexerToken;
};

export type LunarIndexerMarketsResponse = {
  results: LunarIndexerMarket[];
};

export type LunarIndexerMarketSnapshot = {
  id: string;
  chainId: number;
  marketId: string;
  timestamp: number;
  blockNumber: string;
  totalSupplyAssets: string;
  totalBorrowAssets: string;
  totalLiquidity: string;
  totalSupplyAssetsUsd: string;
  totalBorrowAssetsUsd: string;
  totalLiquidityUsd: string;
  loanTokenPrice: string;
  collateralTokenPrice: string;
  supplyApy: string;
  borrowApy: string;
  lltv: string;
  fee: string;
  timeInterval: number;
};

export type LunarIndexerMarketSnapshotsResponse = {
  results: LunarIndexerMarketSnapshot[];
  nextCursor?: string;
};

export type LunarIndexerMarketPosition = {
  chainId: number;
  marketId: string;
  supplyShares: string;
  borrowShares: string;
  collateral: string;
};

export type LunarIndexerAccountPortfolioPosition = {
  timestamp: number;
  markets: LunarIndexerMarketPosition[];
};

export type LunarIndexerAccountPortfolioResponse = {
  account: string;
  positions: LunarIndexerAccountPortfolioPosition[];
};

/**
 * Fetch markets from Lunar Indexer
 */
export async function fetchMarketsFromIndexer(
  lunarIndexerUrl: string,
  chainId: number,
): Promise<LunarIndexerMarketsResponse> {
  const url = `${lunarIndexerUrl}/api/v1/morpho/markets/${chainId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch markets from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch a single market from Lunar Indexer
 */
export async function fetchMarketFromIndexer(
  lunarIndexerUrl: string,
  chainId: number,
  marketId: string,
): Promise<LunarIndexerMarket> {
  const url = `${lunarIndexerUrl}/api/v1/morpho/market/${chainId}/${marketId.toLowerCase()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch market from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch market snapshots from Lunar Indexer
 */
export async function fetchMarketSnapshotsFromIndexer(
  lunarIndexerUrl: string,
  chainId: number,
  marketId: string,
  options?: {
    startTime?: number;
    endTime?: number;
    limit?: number;
    cursor?: string;
    granularity?: "1h" | "6h" | "1d";
  },
): Promise<LunarIndexerMarketSnapshotsResponse> {
  const params = new URLSearchParams();

  if (options?.startTime) {
    params.set("startTime", options.startTime.toString());
  }
  if (options?.endTime) {
    params.set("endTime", options.endTime.toString());
  }
  if (options?.limit) {
    params.set("limit", options.limit.toString());
  }
  if (options?.cursor) {
    params.set("cursor", options.cursor);
  }
  if (options?.granularity) {
    params.set("granularity", options.granularity);
  }

  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/morpho/market/${chainId}/${marketId.toLowerCase()}/snapshots${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch market snapshots from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch account market portfolio from Lunar Indexer
 */
export async function fetchAccountMarketPortfolioFromIndexer(
  lunarIndexerUrl: string,
  accountAddress: string,
  options?: {
    chainId?: number;
    marketId?: string;
    startTime?: number;
    endTime?: number;
    granularity?: "1h" | "6h" | "1d";
  },
): Promise<LunarIndexerAccountPortfolioResponse> {
  const params = new URLSearchParams();

  if (options?.chainId) {
    params.set("chainId", options.chainId.toString());
  }
  if (options?.marketId) {
    params.set("marketId", options.marketId.toLowerCase());
  }
  if (options?.startTime) {
    params.set("startTime", options.startTime.toString());
  }
  if (options?.endTime) {
    params.set("endTime", options.endTime.toString());
  }
  if (options?.granularity) {
    params.set("granularity", options.granularity);
  }

  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/morpho/account/${accountAddress.toLowerCase()}/market-portfolio${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch account market portfolio from Lunar Indexer: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Helper type for rewards data keyed by market
 */
export type GetMorphoMarketsRewardsReturnType = {
  chainId: number;
  marketId: string;
  collateralAssets: Amount | null;
  collateralAssetsUsd: number | null;
  rewardsSupplyApy: number;
  rewardsBorrowApy: number;
  rewards: Required<MorphoReward>[];
};

/**
 * Transform a single market from Lunar Indexer format to SDK MorphoMarket type
 */
export function transformMarketFromIndexer(
  indexerMarket: LunarIndexerMarket,
  environment: Environment,
  rewardsData?: GetMorphoMarketsRewardsReturnType,
  sharedLiquidityData?: PublicAllocatorSharedLiquidityType[],
): MorphoMarket {
  // Find the market configuration in the environment
  const marketKey = Object.keys(environment.config.morphoMarkets).find(
    (key) =>
      environment.config.morphoMarkets[key].id.toLowerCase() ===
      indexerMarket.marketId.toLowerCase(),
  );

  if (!marketKey) {
    throw new Error(
      `Market ${indexerMarket.marketId} not found in environment configuration`,
    );
  }

  const marketConfig = environment.config.morphoMarkets[marketKey];

  // Get token configs from environment
  const loanToken = environment.config.tokens[marketConfig.loanToken];
  const collateralToken =
    environment.config.tokens[marketConfig.collateralToken];

  // Parse prices from indexer
  const loanTokenPrice = Number.parseFloat(indexerMarket.loanTokenPrice);
  const collateralTokenPrice = Number.parseFloat(
    indexerMarket.collateralTokenPrice,
  );

  // Calculate oracle price
  const lltv = Number.parseFloat(indexerMarket.lltv);
  const lltvBigInt = BigInt(Math.floor(lltv * 10 ** 16)); // Convert percentage to 18 decimal bigint

  // Convert string amounts to Amount objects
  const totalSupplyInLoanToken = new Amount(
    BigInt(
      Math.floor(
        Number.parseFloat(indexerMarket.totalSupplyAssets) *
          10 ** loanToken.decimals,
      ),
    ),
    loanToken.decimals,
  );

  const totalBorrows = new Amount(
    BigInt(
      Math.floor(
        Number.parseFloat(indexerMarket.totalBorrowAssets) *
          10 ** loanToken.decimals,
      ),
    ),
    loanToken.decimals,
  );

  const availableLiquidity = new Amount(
    BigInt(
      Math.floor(
        Number.parseFloat(indexerMarket.totalLiquidity) *
          10 ** loanToken.decimals,
      ),
    ),
    loanToken.decimals,
  );

  // Calculate oracle price for collateral conversion
  // Oracle price = collateralTokenPrice / loanTokenPrice with proper decimal adjustment
  const oraclePrice =
    loanTokenPrice > 0 ? collateralTokenPrice / loanTokenPrice : 0;

  // Calculate total supply in collateral token terms
  const totalSupply = new Amount(
    BigInt(
      Math.floor(
        (totalSupplyInLoanToken.value / (oraclePrice || 1)) *
          10 ** collateralToken.decimals,
      ),
    ),
    collateralToken.decimals,
  );

  // Parse APYs
  const baseSupplyApy = Number.parseFloat(indexerMarket.supplyApy);
  const baseBorrowApy = Number.parseFloat(indexerMarket.borrowApy);

  // Calculate USD values
  const totalSupplyUsd = Number.parseFloat(indexerMarket.totalSupplyAssetsUsd);
  const totalBorrowsUsd = Number.parseFloat(indexerMarket.totalBorrowAssetsUsd);
  const availableLiquidityUsd = Number.parseFloat(
    indexerMarket.totalLiquidityUsd,
  );

  // Parse market params
  const marketParams: MorphoMarketParamsType = {
    loanToken: indexerMarket.loanToken.address as Address,
    collateralToken: indexerMarket.collateralToken.address as Address,
    oracle: indexerMarket.oracle as Address,
    irm: indexerMarket.irm as Address,
    lltv: lltvBigInt,
  };

  // Find shared liquidity for this market
  const publicAllocatorSharedLiquidity = sharedLiquidityData || [];

  // Build the MorphoMarket object
  const market: MorphoMarket = {
    chainId: environment.chainId,
    marketId: indexerMarket.marketId,
    marketKey,
    deprecated: marketConfig.deprecated === true,
    loanToValue: lltv / 100, // Convert from percentage to decimal (94.5 -> 0.945)
    performanceFee: Number.parseFloat(indexerMarket.fee),
    loanToken,
    loanTokenPrice,
    collateralToken,
    collateralTokenPrice,
    collateralAssets: rewardsData?.collateralAssets ?? null,
    collateralAssetsUsd: rewardsData?.collateralAssetsUsd ?? null,
    totalSupply,
    totalSupplyUsd,
    totalSupplyInLoanToken,
    totalBorrows,
    totalBorrowsUsd,
    availableLiquidity,
    availableLiquidityUsd,
    marketParams,
    baseSupplyApy,
    baseBorrowApy,
    rewardsSupplyApy: rewardsData?.rewardsSupplyApy ?? 0,
    rewardsBorrowApy: rewardsData?.rewardsBorrowApy ?? 0,
    totalSupplyApr: baseSupplyApy + (rewardsData?.rewardsSupplyApy ?? 0),
    totalBorrowApr: baseBorrowApy + (rewardsData?.rewardsBorrowApy ?? 0),
    rewards: rewardsData?.rewards ?? [],
    publicAllocatorSharedLiquidity,
  };

  return market;
}

/**
 * Transform multiple markets from Lunar Indexer format to SDK MorphoMarket types
 */
export function transformMarketsFromIndexer(
  indexerMarkets: LunarIndexerMarket[],
  environment: Environment,
  rewardsDataMap?: Map<string, GetMorphoMarketsRewardsReturnType>,
  sharedLiquidityMap?: Map<string, PublicAllocatorSharedLiquidityType[]>,
): MorphoMarket[] {
  return indexerMarkets.map((indexerMarket) => {
    const rewardKey = `${environment.chainId}-${indexerMarket.marketId.toLowerCase()}`;
    const rewardsData = rewardsDataMap?.get(rewardKey);
    const sharedLiquidityData = sharedLiquidityMap?.get(
      indexerMarket.marketId.toLowerCase(),
    );

    return transformMarketFromIndexer(
      indexerMarket,
      environment,
      rewardsData,
      sharedLiquidityData,
    );
  });
}
