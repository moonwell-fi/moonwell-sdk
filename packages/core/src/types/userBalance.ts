import type { Amount } from "@moonwell-sdk/common";
import type { TokenConfig } from "@moonwell-sdk/environments";
import type { Address } from "viem";

export type UserBalance = {
  chainId: number;
  account: Address;
  token: TokenConfig;
  tokenBalance: Amount;
};
