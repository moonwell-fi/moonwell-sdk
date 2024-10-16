import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type Market = {
  marketKey: string;
  chainId: number;
  deprecated: boolean;
  seizePaused: boolean;
  transferPaused: boolean;
  marketToken: TokenConfig;
  underlyingToken: TokenConfig;
  collateralFactor: number;
  underlyingPrice: number;
  supplyCaps: Amount;
  supplyCapsUsd: number;
  borrowCaps: Amount;
  borrowCapsUsd: number;
  totalSupply: Amount;
  totalSupplyUsd: number;
  totalBorrows: Amount;
  totalBorrowsUsd: number;
  totalReserves: Amount;
  totalReservesUsd: number;
  cash: Amount;
  exchangeRate: number;
  reserveFactor: number;
  baseSupplyApy: number;
  baseBorrowApy: number;
  totalSupplyApr: number;
  totalBorrowApr: number;
  rewards: MarketReward[];
};

export type MarketReward = {
  token: TokenConfig;
  supplyApr: number;
  borrowApr: number;
};
