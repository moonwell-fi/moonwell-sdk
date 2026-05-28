import { moonbeam } from "viem/chains";

// Chains where raw WELL (`tokenVotes`) is no longer an eligible voting source.
// Centralized so `getUserVotingPowers` and `getDelegates` consult a single
// source of truth — if the policy expands or reverses, both call sites move
// together. See the comment block in `getUserVotingPowers.ts` for the why.
export const RAW_WELL_MASKED_CHAINS: ReadonlySet<number> = new Set([
  moonbeam.id,
]);
