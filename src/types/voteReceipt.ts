import type { Address } from "viem";
import type { Amount } from "../common/index.js";

export type VoteReceipt = {
  chainId: number;
  proposalId: number;
  account: Address;
  voted: boolean;
  option: number;
  votes: Amount;
};
