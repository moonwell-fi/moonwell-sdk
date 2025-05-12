import type { Amount } from "../common/amount.js";
import type { TokenConfig } from "../environments/index.js";
import type { MorphoReward } from "./morphoReward.js";
import type { MorphoStakingReward } from "./morphoStakingReward.js";

export type MorphoVault = {
  chainId: number;
  vaultKey: string;
  vaultToken: TokenConfig;
  underlyingToken: TokenConfig;
  vaultSupply: Amount;
  totalSupply: Amount;
  totalSupplyUsd: number;
  totalLiquidity: Amount;
  totalLiquidityUsd: number;
  totalStaked: Amount;
  totalStakedUsd: number;
  underlyingPrice: number;
  baseApy: number;
  rewardsApy: number;
  totalApy: number;
  stakingRewardsApr: number;
  totalStakingApr: number;
  performanceFee: number;
  curators: string[];
  timelock: number;
  markets: MorphoVaultMarket[];
  rewards: Omit<MorphoReward, "marketId">[];
  stakingRewards: MorphoStakingReward[];
};

export type MorphoVaultMarket = {
  allocation: number;
  marketId: string;
  marketCollateral: TokenConfig;
  marketApy: number;
  marketLiquidity: Amount;
  marketLiquidityUsd: number;
  marketLoanToValue: number;
  totalSupplied: Amount;
  totalSuppliedUsd: number;
  rewards: Omit<MorphoReward, "marketId">[];
};

export type MorphoVaultSnapshot = {
  chainId: number;
  vaultAddress: string;
  totalSupply: number;
  totalSupplyUsd: number;
  totalBorrows: number;
  totalBorrowsUsd: number;
  totalLiquidity: number;
  totalLiquidityUsd: number;
  timestamp: number;
};

export type MorphoVaultStakingSnapshot = {
  chainId: number;
  vaultAddress: string;
  totalStaked: number;
  totalStakedUsd: number;
  timestamp: number;
};
