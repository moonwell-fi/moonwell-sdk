import { Amount } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import { publicEnvironments } from "../../../environments/index.js";
import type { ApiProposal } from "../governor-api-client.js";

export const WORMHOLE_CONTRACT = "0xc8e2b0cd52cf01b0ce87d389daa3d414d4ce29f3";

/**
 * Extract proposal subtitle from description
 */
export const extractProposalSubtitle = (input: string): string => {
  const lines = input.split("\n");
  const h1Line = lines.find((line) => line.startsWith("#"));

  if (!h1Line) {
    return input ? input.substring(0, 100) : "";
  }

  let result = h1Line.substring(1).trim();
  const h2Index = result.indexOf("##");
  if (h2Index !== -1) {
    result = result.substring(0, h2Index).trim();
  }

  result = result.replace(/\\n/g, "").trim();

  if (result.length > 80) {
    result = `${result.substring(0, 80)}...`;
  }

  // Special cases for proposals that don't follow the standard naming convention
  if (result.includes("Moonbeam")) {
    result = result.replace("MIP-B", "MIP-M");
  }

  if (result.indexOf("MIP-B22: Gauntlet") >= 0) {
    result = result.replace("MIP-B22", "MIP-B24");
  }

  if (result.indexOf("MIP-O01: Gauntlet") >= 0) {
    result = result.replace("MIP-O01", "MIP-O03");
  }

  if (result.indexOf("MIP-M02: Upgrade") >= 0) {
    result = result.replace("MIP-M02", "MIP-M03");
  }

  if (result.indexOf("MIP-R02: Upgrade") >= 0) {
    result = result.replace("MIP-R02", "MIP-R03");
  }

  if (result.indexOf("Proposal: Onboard wstETH") >= 0) {
    result = result.replace("Proposal:", "MIP-B08");
  }

  if (
    result.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0
  ) {
    result = result.replace("Gauntlet", "MIP-R10: Gauntlet");
  }

  return result;
};

/**
 * Detects if a proposal is a multichain proposal
 */
export const isMultichainProposal = (targets?: string[]): boolean => {
  return (
    targets?.some(
      (target) => target.toLowerCase() === WORMHOLE_CONTRACT.toLowerCase(),
    ) ?? false
  );
};

export type ApiProposalFormatted = {
  forVotes: Amount;
  againstVotes: Amount;
  abstainVotes: Amount;
  totalVotes: Amount;
  canceled: boolean;
  executed: boolean;
  stateChanges: Array<{
    blockNumber: number;
    transactionHash: string;
    state: string;
    chainId: number;
  }>;
  title: string;
  subtitle: string;
};

/**
 * Parses and formats API proposal data
 */
export const formatApiProposalData = (
  apiProposal: ApiProposal,
): ApiProposalFormatted => {
  const forVotes = new Amount(
    BigInt(Math.floor(apiProposal.forVotes * 1e18)),
    18,
  );
  const againstVotes = new Amount(
    BigInt(Math.floor(apiProposal.againstVotes * 1e18)),
    18,
  );
  const abstainVotes = new Amount(
    BigInt(Math.floor(apiProposal.abstainVotes * 1e18)),
    18,
  );

  const totalVotesValue =
    apiProposal.forVotes + apiProposal.againstVotes + apiProposal.abstainVotes;
  const totalVotes = new Amount(BigInt(Math.floor(totalVotesValue * 1e18)), 18);

  const canceled =
    apiProposal.stateChanges?.some((sc: any) => sc.state === "CANCELED") ??
    false;
  const executed =
    apiProposal.stateChanges?.some((sc: any) => sc.state === "EXECUTED") ??
    false;

  // IMPORTANT: Use sc.chainId from the state change, not apiProposal.chainId
  // This preserves cross-chain events (e.g., QUEUED/EXECUTED on Base with chainId 8453)
  const stateChanges =
    apiProposal.stateChanges?.map((sc: any) => ({
      blockNumber: Number(sc.blockNumber),
      transactionHash: sc.transactionHash,
      state: sc.state,
      chainId: sc.chainId, // Uses the chainId from the state change itself
    })) || [];

  const subtitle = extractProposalSubtitle(apiProposal.description);
  const title = `Proposal #${apiProposal.proposalId}`;

  return {
    forVotes,
    againstVotes,
    abstainVotes,
    totalVotes,
    canceled,
    executed,
    stateChanges,
    title,
    subtitle,
  };
};

export type ProposalOnChainData = {
  state: number;
  proposalData: any;
  eta: number;
  votesCollected: boolean;
  quorum: bigint;
};

/**
 * Fetches on-chain data for multiple proposals
 */
export const getProposalsOnChainData = async (
  apiProposals: ApiProposal[],
  governanceEnvironment: Environment,
): Promise<ProposalOnChainData[]> => {
  let quorum = 0n;

  if (governanceEnvironment.contracts.governor) {
    try {
      quorum =
        governanceEnvironment.chainId === 1284
          ? await governanceEnvironment.contracts.governor.read.quorumVotes()
          : await governanceEnvironment.contracts.governor.read.getQuorum();
    } catch (error) {
      console.warn("Failed to fetch quorum:", error);
    }
  }

  const onChainDataList = await Promise.all(
    apiProposals.map(async (p) => {
      const isMultichain = isMultichainProposal(p.targets);

      const governorContract = isMultichain
        ? governanceEnvironment.contracts.multichainGovernor
        : governanceEnvironment.contracts.governor;

      let state = 0;
      let proposalData = null;

      if (governorContract) {
        try {
          [state, proposalData] = await Promise.all([
            governorContract.read.state([BigInt(p.proposalId)]),
            governorContract.read.proposals([BigInt(p.proposalId)]),
          ]);
        } catch (error) {
          console.warn("Failed to fetch state and proposalData:", error);
        }
      }

      let eta = 0;

      if (proposalData) {
        const onChainEta = Number(proposalData[4]);
        if (onChainEta === 0 && isMultichain && p.votingEndTime) {
          eta = p.votingEndTime + 86400; // 1 day
        } else {
          eta = onChainEta;
        }
      } else if (isMultichain && p.votingEndTime) {
        eta = p.votingEndTime + 86400; // 1 day
      }

      return { state, proposalData, eta, votesCollected: false, quorum };
    }),
  );

  const votesCollectedList = await Promise.all(
    apiProposals.map(async (apiProposal) => {
      const isMultichain = isMultichainProposal(apiProposal.targets);

      if (
        !isMultichain ||
        !governanceEnvironment.contracts.multichainGovernor
      ) {
        return false;
      }

      const xcGovernanceSettings = governanceEnvironment.custom.governance;
      if (!xcGovernanceSettings || xcGovernanceSettings.chainIds.length === 0) {
        return false;
      }

      try {
        const xcEnvironments = xcGovernanceSettings.chainIds
          .map((chainId) =>
            Object.values(publicEnvironments).find(
              (env) => env.chainId === chainId,
            ),
          )
          .filter((env) => {
            if (!env) return false;
            const hasWormhole =
              env.custom &&
              "wormhole" in env.custom &&
              env.custom.wormhole?.chainId;
            const hasVoteCollector =
              env.contracts &&
              "voteCollector" in env.contracts &&
              env.contracts.voteCollector;
            return !!(hasWormhole && hasVoteCollector);
          });

        if (xcEnvironments.length === 0) {
          return false;
        }

        const votesCollectedChecks = await Promise.all(
          xcEnvironments.map(async (xcEnvironment) => {
            try {
              const wormholeChainId = (xcEnvironment!.custom as any)?.wormhole
                ?.chainId;
              if (!wormholeChainId) return false;

              const [forVotes, againstVotes, abstainVotes] =
                await governanceEnvironment.contracts.multichainGovernor!.read.chainVoteCollectorVotes(
                  [wormholeChainId, BigInt(apiProposal.proposalId)],
                );
              return forVotes > 0n || againstVotes > 0n || abstainVotes > 0n;
            } catch (error) {
              return false;
            }
          }),
        );

        return (
          votesCollectedChecks.length > 0 &&
          votesCollectedChecks.every((collected) => collected)
        );
      } catch (error) {
        console.warn("Failed to check votes collected status:", error);
        return false;
      }
    }),
  );

  return onChainDataList.map((data, index) => ({
    ...data,
    votesCollected: votesCollectedList[index] ?? false,
  }));
};
