import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type UserReward = {
  chainId: number;
  account: Address;
  market: TokenConfig;
  rewardToken: TokenConfig;
  supplyRewards: Amount;
  supplyRewardsUsd: number;
  borrowRewards: Amount;
  borrowRewardsUsd: number;
};
