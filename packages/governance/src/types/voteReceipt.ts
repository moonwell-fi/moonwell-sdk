import type { Amount } from "@moonwell-sdk/common";
import type { Address } from "viem";

export type VoteReceipt = {
  account: Address;
  voted: boolean;
  option: number;
  votes: Amount;
};
