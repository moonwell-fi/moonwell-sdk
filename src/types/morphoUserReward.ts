import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type MorphoUserReward =
  | {
      type: "vault-reward";
      chainId: number;
      account: Address;
      vaultId: Address;
      rewardToken: TokenConfig;
      claimableNow: Amount;
      claimableNowUsd: number;
      claimableFuture: Amount;
      claimableFutureUsd: number;
    }
  | {
      type: "merkl-reward";
      chainId: number;
      account: Address;
      rewardToken: TokenConfig;
      claimableNow: Amount;
      claimableNowUsd: number;
      claimableFuture: Amount;
      claimableFutureUsd: number;
    }
  | {
      type: "market-reward";
      chainId: number;
      account: Address;
      marketId: string;
      rewardToken: TokenConfig;
      collateralRewards: {
        claimableNow: Amount;
        claimableNowUsd: number;
        claimableFuture: Amount;
        claimableFutureUsd: number;
      };
      borrowRewards: {
        claimableNow: Amount;
        claimableNowUsd: number;
        claimableFuture: Amount;
        claimableFutureUsd: number;
      };
    }
  | {
      type: "uniform-reward";
      chainId: number;
      account: Address;
      rewardToken: TokenConfig;
      claimableNow: Amount;
      claimableNowUsd: number;
      claimableFuture: Amount;
      claimableFutureUsd: number;
    };
