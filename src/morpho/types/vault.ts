import type { Amount } from "../../common/amount.js";
import type { TokenConfig } from "../../environments/index.js";
import type { MorphoReward } from "./reward.js";

export type MorphoVault = {
  chainId: number;
  vaultToken: TokenConfig;
  underlyingToken: TokenConfig;
  vaultSupply: Amount;
  totalSupply: Amount;
  totalSupplyUsd: number;
  totalLiquidity: Amount;
  totalLiquidityUsd: number;
  underlyingPrice: number;
  baseApy: number;
  totalApy: number;
  performanceFee: number;
  curators: string[];
  timelock: number;
  markets: MorphoVaultMarkets[];
  rewards: Omit<MorphoReward, "marketId">[];
};

export type MorphoVaultMarkets = {
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
