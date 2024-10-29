import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type UserPosition = {
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
};

export type UserPositionSnapshot = {
  chainId: number;
  totalSupplyUsd: number;
  totalBorrowsUsd: number;
  totalCollateralUsd: number;
  timestamp: number;
};
