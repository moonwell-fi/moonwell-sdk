export type ProposalStateChange = {
  id: string;
  proposalId: string;
  state: "CREATED" | "CANCELED" | "EXECUTED" | "QUEUED" | "REBROADCASTED";
  blockNumber: string;
  timestamp: number;
  transactionHash: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
};
