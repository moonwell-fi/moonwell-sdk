/**
 * Lunar Indexer Response Transformers
 *
 * Transforms Lunar Indexer API responses to match the SDK's internal types.
 */

import type { MarketSnapshot } from "../types/market.js";
import type { MorphoVaultStakingSnapshot } from "../types/morphoVault.js";
import type { StakingSnapshot } from "../types/staking.js";
import type { UserPositionSnapshot } from "../types/userPosition.js";
import type {
  LunarMarketSnapshot,
  LunarPortfolio,
  LunarStakingSnapshot,
  LunarVaultStakingSnapshot,
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
    totalSupply: Number(lunar.totalSupplies),
    totalSupplyUsd: Number(lunar.totalSuppliesUSD),
    totalBorrows: Number(lunar.totalBorrows),
    totalBorrowsUsd: Number(lunar.totalBorrowsUSD),
    totalLiquidity: Number(lunar.totalLiquidity),
    totalLiquidityUsd: Number(lunar.totalLiquidityUSD),
    totalReallocatableLiquidity: 0,
    totalReallocatableLiquidityUsd: 0,
    baseSupplyApy: Number(lunar.baseSupplyApy),
    baseBorrowApy: Number(lunar.baseBorrowApy),
    timestamp: Number(lunar.timestamp) * 1000, // Convert unix timestamp to milliseconds
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
// Staking Snapshot Transformation
// ============================================================================

/**
 * Transform a Lunar staking snapshot to SDK StakingSnapshot format
 *
 * Key differences:
 * - Lunar returns totalStaked/totalStakedUSD as decimal strings
 * - Lunar timestamp is already in Unix seconds (same as SDK)
 */
export function transformStakingSnapshot(
  snapshot: LunarStakingSnapshot,
): StakingSnapshot {
  return {
    chainId: snapshot.chainId,
    totalStaked: Number(snapshot.totalStaked),
    totalStakedUSD: Number(snapshot.totalStakedUSD),
    timestamp: snapshot.timestamp,
  };
}

/**
 * Transform an array of Lunar staking snapshots
 */
export function transformStakingSnapshots(
  snapshots: LunarStakingSnapshot[],
): StakingSnapshot[] {
  return snapshots.map(transformStakingSnapshot);
}

// ============================================================================
// Vault Staking Snapshot Transformation
// ============================================================================

/**
 * Transform a Lunar vault staking snapshot to SDK MorphoVaultStakingSnapshot format
 *
 * Key differences:
 * - Lunar returns totalStaked/totalStakedUSD as decimal strings
 * - Lunar timestamp is in Unix seconds; SDK expects milliseconds
 * - Lunar field is totalStakedUSD (uppercase); SDK type is totalStakedUsd (mixed case)
 */
export function transformVaultStakingSnapshot(
  snapshot: LunarVaultStakingSnapshot,
): MorphoVaultStakingSnapshot {
  return {
    chainId: snapshot.chainId,
    vaultAddress: snapshot.vaultAddress,
    totalStaked: Number(snapshot.totalStaked),
    totalStakedUsd: Number(snapshot.totalStakedUSD),
    timestamp: snapshot.timestamp * 1000,
  };
}

/**
 * Transform an array of Lunar vault staking snapshots
 */
export function transformVaultStakingSnapshots(
  snapshots: LunarVaultStakingSnapshot[],
): MorphoVaultStakingSnapshot[] {
  return snapshots.map(transformVaultStakingSnapshot);
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
