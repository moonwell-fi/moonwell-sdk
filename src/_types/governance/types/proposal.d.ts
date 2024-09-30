import type { Address } from "viem";
import type { Amount } from "../../common/index.js";
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
        messages: {
            timestamp: number;
            sequence: number;
        }[];
    }[];
};
export declare enum ProposalState {
    Pending = 0,
    Active = 1,
    Canceled = 2,
    Defeated = 3,
    Succeeded = 4,
    Queued = 5,
    Expired = 6,
    Executed = 7,
    MultichainQueued = 8,
    MultichainExecuted = 9
}
export declare enum MultichainProposalState {
    Active = 0,
    MultichainVoteCollection = 1,
    Canceled = 2,
    Defeated = 3,
    Succeeded = 4,
    Executed = 5
}
export declare const MultichainProposalStateMapping: {
    0: ProposalState;
    1: ProposalState;
    2: ProposalState;
    3: ProposalState;
    4: ProposalState;
    5: ProposalState;
};
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
        messages: {
            timestamp: number;
            sequence: number;
        }[];
    }[];
};
//# sourceMappingURL=proposal.d.ts.map