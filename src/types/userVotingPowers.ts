import type { Amount } from "../common/index.js";

export type UserVotingPowers = {
  chainId: number;
  totalDelegated: Amount;
  totalDelegatedSelf: Amount;
  totalDelegatedOthers: Amount;
  tokenBalance: Amount;
  tokenDelegated: Amount;
  tokenDelegatedSelf: Amount;
  tokenDelegatedOthers: Amount;
  tokenUndelegated: Amount;
  claimsBalance: Amount;
  claimsDelegated: Amount;
  claimsDelegatedSelf: Amount;
  claimsDelegatedOthers: Amount;
  claimsUndelegated: Amount;
  stakingDelegated: Amount;
  tokenDelegates: `0x${string}`;
  claimsDelegates: `0x${string}`;
};
