import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type MorphoUserStakingReward = {
  chainId: number;
  amount: Amount;
  amountUsd: number;
  token: TokenConfig;
};
