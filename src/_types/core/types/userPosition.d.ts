import type { Address } from "viem";
import type { Amount } from "../../common/index.js";
import type { TokenConfig } from "../../environments/index.js";
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
//# sourceMappingURL=userPosition.d.ts.map