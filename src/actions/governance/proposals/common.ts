import axios from "axios";
import { last } from "lodash";
import { moonriver } from "viem/chains";
import { Amount } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import { publicEnvironments } from "../../../environments/index.js";
import {
  MultichainProposalStateMapping,
  type Proposal,
  type ProposalState,
} from "../../../types/proposal.js";
import type { ApiProposal } from "../governor-api-client.js";

type PonderExtendedProposalData = {
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
  }[];
};

axios.defaults.timeout = 5_000;

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

/**
 * Append extended proposal data (Ponder-based, for Moonriver)
 */
export const appendProposalExtendedData = (
  proposals: Proposal[],
  extendedDatas: PonderExtendedProposalData[],
) => {
  proposals.forEach((proposal) => {
    const extendedData = extendedDatas.find(
      (item) => item.id === proposal.proposalId,
    );

    if (extendedData) {
      proposal.title = extendedData.title;
      proposal.calldatas = extendedData.calldatas;
      proposal.description = extendedData.description;
      proposal.signatures = extendedData.signatures;
      proposal.stateChanges = extendedData.stateChanges.map((change) => ({
        blockNumber: change.blockNumber,
        transactionHash: change.transactionHash,
        state: change.state,
        chainId: proposal.chainId,
      }));
      proposal.subtitle = extendedData.subtitle;
      proposal.targets = extendedData.targets;
    }
  });
};

/**
 * Get proposal data from on-chain (Ponder-based, for Moonriver)
 */
export const getProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  if (params.environment.contracts.governor) {
    let count = 0n;
    let quorum = 0n;

    if (params.environment.chainId === moonriver.id) {
      [count, quorum] = await Promise.all([
        params.environment.contracts.governor.read.proposalCount(),
        params.environment.contracts.governor.read.getQuorum(),
      ]);
    } else {
      [count, quorum] = await Promise.all([
        params.environment.contracts.governor.read.proposalCount(),
        params.environment.contracts.governor.read.quorumVotes(),
      ]);
    }

    if (params.id) {
      if (BigInt(params.id) > count) {
        return [];
      }
    }

    const ids = params.id
      ? [BigInt(params.id)]
      : Array.from({ length: Number(count) }, (_, i) => count - BigInt(i));

    const proposalDataCall = Promise.all(
      ids.map((id) =>
        params.environment.contracts.governor?.read.proposals([id]),
      ),
    );

    const proposalStateCall = Promise.all(
      ids.map((id) => params.environment.contracts.governor?.read.state([id])),
    );

    const [proposalsData, proposalsState] = await Promise.all([
      proposalDataCall,
      proposalStateCall,
    ]);

    const proposals = proposalsData?.map((item, index: number) => {
      const state = proposalsState?.[index]!;

      const [
        id,
        proposer,
        eta,
        startTimestamp,
        endTimestamp,
        startBlock,
        forVotes,
        againstVotes,
        abstainVotes,
        totalVotes,
        canceled,
        executed,
      ] = item!;

      const proposal: Proposal = {
        chainId: params.environment.chainId,
        id: Number(id),
        proposalId: Number(id),
        proposer,
        eta: Number(eta),
        startTimestamp: Number(startTimestamp),
        endTimestamp: Number(endTimestamp),
        startBlock: Number(startBlock),
        forVotes: new Amount(forVotes, 18),
        againstVotes: new Amount(againstVotes, 18),
        abstainVotes: new Amount(abstainVotes, 18),
        totalVotes: new Amount(totalVotes, 18),
        canceled,
        executed,
        quorum: new Amount(quorum, 18),
        state,
      };

      return proposal;
    });

    return proposals;
  } else {
    return [];
  }
};

/**
 * Get cross-chain proposal data (Ponder-based, for Moonriver)
 */
export const getCrossChainProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  if (params.environment.contracts.governor) {
    const xcGovernanceSettings = params.environment.custom.governance;
    if (
      params.environment.contracts.multichainGovernor &&
      xcGovernanceSettings &&
      xcGovernanceSettings.chainIds.length > 0
    ) {
      const xcEnvironments = xcGovernanceSettings.chainIds
        .map((chainId) =>
          (Object.values(publicEnvironments) as Environment[]).find(
            (env) => env.chainId === chainId,
          ),
        )
        .filter((xcEnvironment) => !!xcEnvironment)
        .filter(
          (xcEnvironment) =>
            xcEnvironment!.custom?.wormhole?.chainId &&
            xcEnvironment!.contracts.voteCollector,
        );

      const [xcCount, xcQuorum] = await Promise.all([
        params.environment.contracts.multichainGovernor.read.proposalCount(),
        params.environment.contracts.multichainGovernor.read.quorum(),
      ]);

      if (params.id) {
        params.id =
          Number(params.id) -
          (params.environment.custom?.governance?.proposalIdOffset || 0);

        if (params.id < 0) {
          return [];
        } else {
          if (BigInt(params.id) > xcCount) {
            return [];
          }
        }
      }

      const ids = params.id
        ? [BigInt(params.id)]
        : Array.from(
            { length: Number(xcCount) },
            (_, i) => xcCount - BigInt(i),
          );

      const xcProposalsDataCall = Promise.all(
        ids.map((id) =>
          params.environment.contracts.multichainGovernor?.read.proposals([id]),
        ),
      );

      const xcProposalsStateCall = Promise.all(
        ids.map((id) =>
          params.environment.contracts.multichainGovernor?.read.state([id]),
        ),
      );

      const xcVotesCall = Promise.all(
        xcEnvironments.map((xcEnvironment) =>
          Promise.all(
            ids.map((id) =>
              params.environment.contracts.multichainGovernor?.read.chainVoteCollectorVotes(
                [(xcEnvironment!.custom as any).wormhole.chainId, id],
              ),
            ),
          ),
        ),
      );

      const [xcProposalsData, xcProposalsState, xcVotes] = await Promise.all([
        xcProposalsDataCall,
        xcProposalsStateCall,
        xcVotesCall,
      ]);

      const proposals = ids.map((xcId, proposalIndex: number) => {
        const state = xcProposalsState?.[proposalIndex]!;
        const id =
          Number(xcId) +
          (params.environment.custom?.governance?.proposalIdOffset || 0);

        const votesCollected = false;

        const votes = xcVotes.reduce(
          (prevVotes, currVotes) => {
            const voteData = currVotes[proposalIndex];
            if (!voteData) {
              return prevVotes;
            }

            // chainVoteCollectorVotes returns [forVotes, againstVotes, abstainVotes]
            const forVotes = voteData[0] || 0n;
            const againstVotes = voteData[1] || 0n;
            const abstainVotes = voteData[2] || 0n;
            const totalVotes = forVotes + againstVotes + abstainVotes;

            return {
              totalVotes: prevVotes.totalVotes + totalVotes,
              forVotes: prevVotes.forVotes + forVotes,
              againstVotes: prevVotes.againstVotes + againstVotes,
              abstainVotes: prevVotes.abstainVotes + abstainVotes,
            };
          },
          { totalVotes: 0n, forVotes: 0n, againstVotes: 0n, abstainVotes: 0n },
        );

        const proposalData = xcProposalsData?.[proposalIndex];
        if (!proposalData) {
          throw new Error(`Proposal data not found for index ${proposalIndex}`);
        }

        const [
          proposer,
          _voteSnapshotTimestamp,
          votingStartTime,
          votingEndTime,
          crossChainVoteCollectionEndTimestamp,
          voteSnapshotBlock,
          proposalForVotes,
          proposalAgainstVotes,
          proposalAbstainVotes,
          proposalTotalVotes,
          canceled,
          executed,
        ] = proposalData;

        const multichainState = (
          MultichainProposalStateMapping as { [key: number]: ProposalState }
        )[state]!;

        const proposal: Proposal = {
          chainId: params.environment.chainId,
          id,
          proposalId: Number(xcId),
          proposer,
          eta: Number(crossChainVoteCollectionEndTimestamp),
          startTimestamp: Number(votingStartTime),
          endTimestamp: Number(votingEndTime),
          startBlock: Number(voteSnapshotBlock),
          forVotes: new Amount(proposalForVotes + votes.forVotes, 18),
          againstVotes: new Amount(
            proposalAgainstVotes + votes.againstVotes,
            18,
          ),
          abstainVotes: new Amount(
            proposalAbstainVotes + votes.abstainVotes,
            18,
          ),
          totalVotes: new Amount(proposalTotalVotes + votes.totalVotes, 18),
          canceled,
          executed,
          quorum: new Amount(xcQuorum, 18),
          state: multichainState,
          multichain: {
            id: Number(xcId),
            votesCollected,
          },
        };

        return proposal;
      });

      return proposals;
    } else {
      return [];
    }
  } else {
    return [];
  }
};

/**
 * Get extended proposal data from Ponder (for Moonriver)
 */
export const getExtendedProposalData = async (params: {
  environment: Environment;
  id?: number;
}): Promise<PonderExtendedProposalData[]> => {
  let result: PonderExtendedProposalData[] = [];
  let lastId = -1;
  let shouldContinue = true;

  while (shouldContinue) {
    const response = await axios.post<{
      data: {
        proposals: {
          items: {
            proposalId: number;
            description: string;
            targets: string[];
            calldatas: string[];
            signatures: string[];
            stateChanges: {
              items: {
                txnHash: string;
                blockNumber: number;
                newState: string;
              }[];
            };
          }[];
        };
      };
    }>("https://ponder-eu2.moonwell.fi", {
      query: `
          query {
            proposals(
              limit: 1000,
              orderDirection: "desc",
              orderBy: "proposalId",
              where: {
                chainId: ${params.environment.chainId}
                ${params.id ? `, proposalId: ${params.id}` : lastId >= 0 ? `, proposalId_lt: ${lastId}` : ""}
              }
            ) {
              items {
                id
                proposalId
                description
                targets
                calldatas
                signatures
                stateChanges(orderBy: "blockNumber") {
                  items {
                    txnHash
                    blockNumber
                    newState
                  }
                }
              }
            }
          }
        `,
    });

    if (response.status === 200 && response.data?.data?.proposals) {
      const proposals = response.data.data.proposals.items.map((item) => {
        const extendedProposalData: PonderExtendedProposalData = {
          id: item.proposalId,
          title: `Proposal #${item.proposalId}`,
          subtitle: extractProposalSubtitle(item.description),
          description: item.description,
          calldatas: item.calldatas,
          signatures: item.signatures,
          stateChanges: item.stateChanges.items.map((change) => {
            return {
              blockNumber: change.blockNumber,
              state: change.newState,
              transactionHash: change.txnHash,
            };
          }),
          targets: item.targets,
        };

        return extendedProposalData;
      });

      if (proposals.length < 1000 || proposals.length === 0) {
        shouldContinue = false;
      } else {
        lastId = last(proposals)!.id;
      }

      result = result.concat(proposals);
    } else {
      shouldContinue = false;
    }
  }

  return result;
};
