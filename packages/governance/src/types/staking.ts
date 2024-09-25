import type { Amount } from "@moonwell-sdk/common";
import type { TokenConfig } from "@moonwell-sdk/environments";

export type StakingInfo = {
  chainId: number;
  stakingToken: TokenConfig;
  token: TokenConfig;
  cooldown: number;
  unstakeWindow: number;
  distributionEnd: number;
  totalSupply: Amount;
  totalSupplyUSD: number;
  tokenPrice: number;
  apr: number;
};

export type StakingSnapshot = {
  chainId: number;
  totalStaked: number;
  totalStakedUSD: number;
  timestamp: number;
};

export type UserStakingInfo = {
  chainId: number;
  cooldownActive: boolean;
  cooldownStart: number;
  cooldownEnding: number;
  unstakingStart: number;
  unstakingEnding: number;
  pendingRewards: Amount;
  stakingToken: TokenConfig;
  stakingTokenBalance: Amount;
  token: TokenConfig;
  tokenBalance: Amount;
  tokenPrice: number;
};
