/**
 * Lunar Indexer Response Transformation Utilities for Morpho Markets
 *
 * This module provides transformation functions to convert Lunar Indexer API responses
 * into SDK MorphoMarket types. The indexer returns string values that need to be converted
 * to proper numeric types and Amount objects.
 *
 * @module morpho/markets/lunarIndexerTransform
 */

import axios from "axios";
import type { Address } from "viem";
import { parseUnits } from "viem";
import { Amount } from "../../../common/amount.js";
import type { Environment } from "../../../environments/index.js";
import type { MarketSnapshot } from "../../../types/market.js";
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

export type LunarIndexerMarketReward = {
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenName: string;
  supplyApr: string;
  borrowApr: string;
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
  rewards?: LunarIndexerMarketReward[];
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

/**
 * Transform a Lunar Indexer isolated market snapshot to SDK MarketSnapshot format
 *
 * @param options.normalizeToCollateral - Set true for markets where totalSupplyAssets
 *   is denominated in the loan token but the chart needs collateral-equivalent units
 *   (e.g. the USDC/ETH market where loan = WETH and collateral = USDC: the indexer
 *   returns supply in WETH units, but we need USDC units for the chart).
 */
export function transformIsolatedMarketSnapshotFromIndexer(
  snapshot: LunarIndexerMarketSnapshot,
  options?: { normalizeToCollateral?: boolean },
): MarketSnapshot {
  const collateralTokenPrice = Number.parseFloat(snapshot.collateralTokenPrice);
  const loanTokenPrice = Number.parseFloat(snapshot.loanTokenPrice);
  const totalSupplyAssetsUsd = Number.parseFloat(snapshot.totalSupplyAssetsUsd);
  const totalLiquidityUsd = Number.parseFloat(snapshot.totalLiquidityUsd);

  const needsUsdNormalization = options?.normalizeToCollateral === true;

  const totalSupply =
    needsUsdNormalization && collateralTokenPrice > 0
      ? totalSupplyAssetsUsd / collateralTokenPrice
      : Number.parseFloat(snapshot.totalSupplyAssets);

  const totalLiquidity =
    needsUsdNormalization && collateralTokenPrice > 0
      ? totalLiquidityUsd / collateralTokenPrice
      : Number.parseFloat(snapshot.totalLiquidity);

  return {
    chainId: snapshot.chainId,
    marketId: snapshot.marketId.toLowerCase(),
    timestamp: snapshot.timestamp * 1000,
    totalSupply,
    totalSupplyUsd: totalSupplyAssetsUsd,
    totalBorrows: Number.parseFloat(snapshot.totalBorrowAssets),
    totalBorrowsUsd: Number.parseFloat(snapshot.totalBorrowAssetsUsd),
    totalLiquidity,
    totalLiquidityUsd,
    baseSupplyApy: Number.parseFloat(snapshot.supplyApy),
    baseBorrowApy: Number.parseFloat(snapshot.borrowApy),
    loanTokenPrice,
    collateralTokenPrice,
  };
}

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
  options?: { includeRewards?: boolean },
): Promise<LunarIndexerMarketsResponse> {
  const params = new URLSearchParams();
  if (options?.includeRewards) {
    params.set("includeRewards", "true");
  }
  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/isolated/markets/${chainId}${queryString ? `?${queryString}` : ""}`;
  const response = await axios.get<LunarIndexerMarketsResponse>(url);
  return response.data;
}

/**
 * Fetch a single market from Lunar Indexer
 */
export async function fetchMarketFromIndexer(
  lunarIndexerUrl: string,
  chainId: number,
  marketId: string,
): Promise<LunarIndexerMarket> {
  const url = `${lunarIndexerUrl}/api/v1/isolated/market/${chainId}/${marketId.toLowerCase()}`;
  const response = await axios.get<LunarIndexerMarket>(url);
  return response.data;
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

  if (options?.startTime !== undefined) {
    params.set("startTime", options.startTime.toString());
  }
  if (options?.endTime !== undefined) {
    params.set("endTime", options.endTime.toString());
  }
  if (options?.limit !== undefined) {
    params.set("limit", options.limit.toString());
  }
  if (options?.cursor !== undefined) {
    params.set("cursor", options.cursor);
  }
  if (options?.granularity !== undefined) {
    params.set("granularity", options.granularity);
  }

  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/isolated/market/${chainId}/${marketId.toLowerCase()}/snapshots${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axios.get<LunarIndexerMarketSnapshotsResponse>(url);
  return response.data;
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

  if (options?.chainId !== undefined) {
    params.set("chainId", options.chainId.toString());
  }
  if (options?.marketId !== undefined) {
    params.set("marketId", options.marketId.toLowerCase());
  }
  if (options?.startTime !== undefined) {
    params.set("startTime", options.startTime.toString());
  }
  if (options?.endTime !== undefined) {
    params.set("endTime", options.endTime.toString());
  }
  if (options?.granularity !== undefined) {
    params.set("granularity", options.granularity);
  }

  const queryString = params.toString();
  const url = `${lunarIndexerUrl}/api/v1/isolated/account/${accountAddress.toLowerCase()}/portfolio${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axios.get<LunarIndexerAccountPortfolioResponse>(url);
  return response.data;
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
  collateralPriceOverride?: number,
): MorphoMarket | null {
  // Find the market configuration in the environment
  const marketKey = Object.keys(environment.config.morphoMarkets).find(
    (key) =>
      environment.config.morphoMarkets[key].id.toLowerCase() ===
      indexerMarket.marketId.toLowerCase(),
  );

  if (!marketKey) {
    return null;
  }

  const marketConfig = environment.config.morphoMarkets[marketKey];

  // Get token configs from environment
  const loanToken = environment.config.tokens[marketConfig.loanToken];
  const collateralToken =
    environment.config.tokens[marketConfig.collateralToken];

  // Parse prices from indexer
  const loanTokenPrice = Number.parseFloat(indexerMarket.loanTokenPrice);
  const collateralTokenPrice =
    collateralPriceOverride ??
    Number.parseFloat(indexerMarket.collateralTokenPrice);

  // Calculate oracle price
  const lltv = Number.parseFloat(indexerMarket.lltv);
  const lltvBigInt = BigInt(Math.floor(lltv * 10 ** 16)); // Convert percentage to 18 decimal bigint

  // Use parseUnits (viem) to convert decimal strings to BigInt — avoids float64
  // precision loss for large USDC amounts (e.g. "1026834782.838286" * 10^6).
  // parseUnits can throw on malformed strings (e.g. scientific notation), so we
  // wrap each call and fall back to 0n to avoid crashing the entire market list.
  const safeParseUnits = (value: string, decimals: number): bigint => {
    try {
      return parseUnits(value, decimals);
    } catch {
      return 0n;
    }
  };

  const totalSupplyInLoanToken = new Amount(
    safeParseUnits(indexerMarket.totalSupplyAssets, loanToken.decimals),
    loanToken.decimals,
  );

  const totalBorrows = new Amount(
    safeParseUnits(indexerMarket.totalBorrowAssets, loanToken.decimals),
    loanToken.decimals,
  );

  const availableLiquidity = new Amount(
    safeParseUnits(indexerMarket.totalLiquidity, loanToken.decimals),
    loanToken.decimals,
  );

  // Calculate oracle price for collateral conversion
  // Oracle price = collateralTokenPrice / loanTokenPrice with proper decimal adjustment
  const oraclePrice =
    loanTokenPrice > 0 ? collateralTokenPrice / loanTokenPrice : 0;

  // Calculate total supply in collateral token terms.
  // When oraclePrice = 0 (missing collateral price), return 0 rather than falling
  // back to oraclePrice=1 which would produce a meaningless loan-token-sized number.
  const totalSupply = new Amount(
    oraclePrice > 0
      ? BigInt(
          Math.floor(
            (totalSupplyInLoanToken.value / oraclePrice) *
              10 ** collateralToken.decimals,
          ),
        )
      : 0n,
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
// stkWELL is not priced correctly by the indexer: its oracle is the same as WELL's oracle
// and the two tokens trade at the same price. Override with the WELL price to avoid
// displaying zero or incorrect collateral prices for stkWELL markets.
export const PRICE_ALIAS: Record<string, string> = {
  stkWELL: "WELL",
};

export function transformMarketsFromIndexer(
  indexerMarkets: LunarIndexerMarket[],
  environment: Environment,
  rewardsDataMap?: Map<string, GetMorphoMarketsRewardsReturnType>,
  sharedLiquidityMap?: Map<string, PublicAllocatorSharedLiquidityType[]>,
): MorphoMarket[] {
  // Build symbol → price map from markets that have a known price.
  const tokenPriceBySymbol = new Map<string, number>();
  const setPriceWithCheck = (symbol: string, price: number) => {
    tokenPriceBySymbol.set(symbol, price);
  };

  for (const m of indexerMarkets) {
    const loanPrice = Number.parseFloat(m.loanTokenPrice);
    const collateralPrice = Number.parseFloat(m.collateralTokenPrice);
    if (loanPrice > 0) setPriceWithCheck(m.loanToken.symbol, loanPrice);
    if (collateralPrice > 0)
      setPriceWithCheck(m.collateralToken.symbol, collateralPrice);
  }

  return indexerMarkets.flatMap((indexerMarket) => {
    const rewardKey = `${environment.chainId}-${indexerMarket.marketId.toLowerCase()}`;
    const rewardsData = rewardsDataMap?.get(rewardKey);
    const sharedLiquidityData = sharedLiquidityMap?.get(rewardKey);

    // Resolve price override for tokens that alias another token's price
    const collateralSymbol = indexerMarket.collateralToken.symbol;
    const collateralPrice = Number.parseFloat(
      indexerMarket.collateralTokenPrice,
    );
    const aliasSymbol = PRICE_ALIAS[collateralSymbol];
    const collateralPriceOverride =
      collateralPrice === 0 && aliasSymbol
        ? tokenPriceBySymbol.get(aliasSymbol)
        : undefined;

    const market = transformMarketFromIndexer(
      indexerMarket,
      environment,
      rewardsData,
      sharedLiquidityData,
      collateralPriceOverride,
    );

    return market ? [market] : [];
  });
}
