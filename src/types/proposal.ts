import type { Address } from "viem";
import type { Amount } from "../common/index.js";
import type { Environment } from "../environments/index.js";

export type Proposal = {
  chainId: number;
  id: number;
  proposalId: number;
  proposer: Address;
  eta: number;
  startTimestamp: number;
  endTimestamp: number;
  startBlock: number;
  forVotes: Amount;
  againstVotes: Amount;
  abstainVotes: Amount;
  totalVotes: Amount;
  canceled: boolean;
  executed: boolean;
  quorum: Amount;
  state: ProposalState;
  multichain?: {
    id: number;
    votesCollected: boolean;
  };
  /**
   * Authoritative per-chain voting-power snapshot blocks resolved by the
   * lunar-indexer, keyed by chain name (`mainnet` → 1, `base` → 8453,
   * `optimism` → 10, `moonbeam` → 1284). Block numbers are decimal strings.
   *
   * Present on indexer-sourced multichain proposals; absent for older
   * proposals indexed before the field existed and for on-chain (Moonriver)
   * proposals. Consumers reading voting power should prefer these blocks over
   * resolving the snapshot timestamp to a block client-side.
   */
  snapshotBlocks?: Record<string, string>;
  //proposal extended data
  title?: string;
  subtitle?: string;
  description?: string;
  targets?: string[];
  calldatas?: string[];
  signatures?: string[];
  stateChanges?: {
    blockNumber: number;
    transactionHash: string;
    state: string;
    chainId: number;
    timestamp?: number;
  }[];
  environment?: Environment;
};

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
  MultichainQueued = 8,
  MultichainExecuted = 9,
}

//@internal
export enum MultichainProposalState {
  Active = 0,
  MultichainVoteCollection = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Executed = 5,
}

//@internal
export const MultichainProposalStateMapping = {
  [MultichainProposalState.Active]: ProposalState.Active,
  [MultichainProposalState.MultichainVoteCollection]: ProposalState.Queued,
  [MultichainProposalState.Canceled]: ProposalState.Canceled,
  [MultichainProposalState.Defeated]: ProposalState.Defeated,
  [MultichainProposalState.Succeeded]: ProposalState.Succeeded,
  [MultichainProposalState.Executed]: ProposalState.Executed,
};

//@internal
export type ExtendedProposalData = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targets: string[];
  calldatas: string[];
  signatures: string[];
  stateChanges: {
    blockNumber: number;
    transactionHash: string;
    state: string;
    chainId: number;
    timestamp?: number;
  }[];
};
