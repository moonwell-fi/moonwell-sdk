import type { Address } from "viem";
import type { Amount } from "../../common/index.js";

export type VoteReceipt = {
  account: Address;
  voted: boolean;
  option: number;
  votes: Amount;
};
