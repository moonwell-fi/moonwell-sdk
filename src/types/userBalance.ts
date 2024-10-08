import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { TokenConfig } from "../environments/index.js";

export type UserBalance = {
  chainId: number;
  account: Address;
  token: TokenConfig;
  tokenBalance: Amount;
};
