import type { Amount } from "@moonwell-sdk/common";
import type { TokenConfig } from "@moonwell-sdk/environments";
import type { Address } from "viem";

export type UserPosition = {
  chainId: number;
  account: Address;
  markets: UserMarketPosition[];
  totalSuppliedUsd: number;
  totalCollateralUsd: number;
  totalBorrowedUsd: number;
};

export type UserMarketPosition = {
  chainId: number;
  account: Address;
  market: TokenConfig;
  collateralEnabled: boolean;
  supplied: Amount;
  suppliedUsd: number;
  collateral: Amount;
  collateralUsd: number;
  borrowed: Amount;
  borrowedUsd: number;
  rewards: UserMarketReward[];
};

export type UserMarketReward = {
  chainId: number;
  account: Address;
  market: TokenConfig;
  rewardToken: TokenConfig;
  supplyRewards: Amount;
  supplyRewardsUsd: number;
  borrowRewards: Amount;
  borrowRewardsUsd: number;
};
