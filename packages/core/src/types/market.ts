import type { Amount } from "@moonwell-sdk/common";
import type { TokenConfig } from "@moonwell-sdk/environments";

export type CoreMarket = {
  chainId: number;
  seizeGuardianPaused: boolean;
  transferGuardianPaused: boolean;
  markets: Market[];
  totalSupplyUsd: number;
  totalBorrowsUsd: number;
};

export type Market = {
  chainId: number;
  deprecated: boolean;
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
  rewards: MarketRewards[];
};

export type MarketRewards = {
  token: TokenConfig;
  supplyApr: number;
  borrowApr: number;
};
