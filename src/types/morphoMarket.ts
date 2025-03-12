import type { Address } from "viem";
import type { Amount } from "../common/amount.js";
import type { TokenConfig } from "../environments/index.js";
import type { MorphoReward } from "./morphoReward.js";

export type MorphoMarket = {
  chainId: number;
  marketId: string;
  marketKey: string;
  deprecated: boolean;
  loanToValue: number;
  performanceFee: number;
  loanToken: TokenConfig;
  loanTokenPrice: number;
  collateralAssets: Amount;
  collateralToken: TokenConfig;
  collateralTokenPrice: number;
  totalSupply: Amount;
  totalSupplyUsd: number;
  totalSupplyInLoanToken: Amount;
  totalBorrows: Amount;
  totalBorrowsUsd: number;
  availableLiquidity: Amount;
  availableLiquidityUsd: number;
  marketParams: MorphoMarketParamsType;
  baseSupplyApy: number;
  rewardsSupplyApy: number;
  baseBorrowApy: number;
  rewardsBorrowApy: number;
  totalSupplyApr: number;
  totalBorrowApr: number;
  rewards: Required<MorphoReward>[];
  publicAllocatorSharedLiquidity: PublicAllocatorSharedLiquidityType[];
};

export type MorphoMarketParamsType = {
  loanToken: Address;
  collateralToken: Address;
  irm: Address;
  lltv: bigint;
  oracle: Address;
};

export type PublicAllocatorSharedLiquidityType = {
  assets: number;
  vault: {
    address: string;
    name: string;
    publicAllocatorConfig: {
      fee: number;
      flowCaps: {
        market: {
          uniqueKey: string;
        };
        maxIn: number;
        maxOut: number;
      }[];
    };
  };
  allocationMarket?: {
    uniqueKey: string;
    loanAsset: {
      address: string;
    };
    collateralAsset?: {
      address: string;
    };
    oracleAddress: string;
    irmAddress: string;
    lltv: string;
  };
};
