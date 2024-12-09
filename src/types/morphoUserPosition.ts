import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type MorphoVaultUserPosition = {
  chainId: number;
  account: Address;
  vaultToken: TokenConfig;
  underlyingToken: TokenConfig;
  supplied: Amount;
  suppliedShares: Amount;
};

export type MorphoMarketUserPosition = {
  chainId: number;
  account: Address;
  marketId: string;
  loanToken: TokenConfig;
  collateralToken: TokenConfig;
  supplied: Amount;
  borrowed: Amount;
  borrowedShares: Amount;
};

export type MorphoVaultUserPositionSnapshot = {
  chainId: number;
  account: Address;
  vaultAddress: Address;
  suppliedUsd: number;
  timestamp: number;
};
