/**
 * Lunar Indexer Response Transformers
 *
 * Transforms Lunar Indexer API responses to match the SDK's internal types.
 */

import type { MarketSnapshot } from "../types/market.js";
import type { UserPositionSnapshot } from "../types/userPosition.js";
import type {
  LunarMarketSnapshot,
  LunarPortfolio,
} from "./lunar-indexer-client.js";

// ============================================================================
// Market Snapshot Transformation
// ============================================================================

/**
 * Transform a Lunar market snapshot to SDK MarketSnapshot format
 *
 * Key differences:
 * - Lunar uses decimal numbers, SDK uses numbers
 * - Lunar has timeInterval field (not needed in SDK)
 * - Field name mapping: totalSupplies → totalSupply, totalBorrows → totalBorrows
 */
export function transformMarketSnapshot(
  lunar: LunarMarketSnapshot,
  chainId: number,
): MarketSnapshot {
  return {
    chainId,
    marketId: lunar.marketAddress,
    totalSupply: lunar.totalSupplies,
    totalSupplyUsd: lunar.totalSuppliesUSD,
    totalBorrows: lunar.totalBorrows,
    totalBorrowsUsd: lunar.totalBorrowsUSD,
    totalLiquidity: lunar.totalLiquidity,
    totalLiquidityUsd: lunar.totalLiquidityUSD,
    baseSupplyApy: lunar.baseSupplyApy,
    baseBorrowApy: lunar.baseBorrowApy,
    timestamp: lunar.timestamp * 1000, // Convert unix timestamp to milliseconds
    loanTokenPrice: 0, // Calculated in getMarketSnapshots
    collateralTokenPrice: 0, // Calculated in getMarketSnapshots
  };
}

/**
 * Transform an array of Lunar market snapshots
 */
export function transformMarketSnapshots(
  snapshots: LunarMarketSnapshot[],
  chainId: number,
): MarketSnapshot[] {
  return snapshots.map((snapshot) =>
    transformMarketSnapshot(snapshot, chainId),
  );
}

// ============================================================================
// Portfolio/User Position Transformation
// ============================================================================

/**
 * Transform Lunar portfolio to SDK UserPositionSnapshot array
 *
 * Key transformation:
 * - Aggregate per-market USD balances across all markets per timestamp
 * - Sum supplyBalanceUsd → totalSupplyUsd
 * - Sum borrowBalanceUsd → totalBorrowsUsd
 * - Assume totalCollateralUsd = totalSupplyUsd (all supplies are collateral)
 */
export function transformPortfolioToSnapshots(
  lunarPortfolio: LunarPortfolio,
  chainId: number,
): UserPositionSnapshot[] {
  return lunarPortfolio.positions.map((position) => {
    const totalSupplyUsd = position.markets.reduce(
      (sum, market) => sum + Number.parseFloat(market.supplyBalanceUsd || "0"),
      0,
    );

    const totalBorrowsUsd = position.markets.reduce(
      (sum, market) => sum + Number.parseFloat(market.borrowBalanceUsd || "0"),
      0,
    );

    return {
      chainId,
      timestamp: position.timestamp * 1000, // Convert unix timestamp (seconds) to milliseconds
      totalSupplyUsd,
      totalBorrowsUsd,
      totalCollateralUsd: totalSupplyUsd, // Assuming all supplies are collateral
    };
  });
}

// ============================================================================
// Pagination Transformation
// ============================================================================

/**
 * Check if there are more pages available
 */
export function hasMorePages(nextCursor: string | null): boolean {
  return nextCursor !== null;
}

/**
 * Extract cursor for next page
 */
export function getNextCursor(nextCursor: string | null): string | undefined {
  return nextCursor || undefined;
}
