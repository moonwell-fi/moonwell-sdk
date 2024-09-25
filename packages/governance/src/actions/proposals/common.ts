import axios from "axios";
import _ from "lodash";

import { type ExtendedProposalData, MultichainProposalStateMapping, type Proposal, ProposalState } from "@/types/proposal.js";
import { Amount } from "@moonwell-sdk/common";
import { type Environment, environments } from "@moonwell-sdk/environments";
import { moonriver } from "viem/chains";

axios.defaults.timeout = 5_000;

export const appendProposalExtendedData = (proposals: Proposal[], extendedDatas: ExtendedProposalData[]) => {
  proposals.forEach((proposal) => {
    const extendedData = extendedDatas.find((item) => item.id === proposal.id);

    if (extendedData) {
      const lastProposalUpdate = _.first(_.last(extendedData.stateChanges)?.messages);

      // If the xChain timestamp is in the future, but less than 24 hours from now, it is queued
      if (lastProposalUpdate && lastProposalUpdate.timestamp > 0) {
        const now = Math.floor(Date.now() / 1000);
        if (lastProposalUpdate.timestamp + 60 * 60 * 24 > now) {
          proposal.state = ProposalState.MultichainQueued;
        } else {
          proposal.state = ProposalState.MultichainExecuted;
        }
      }

      proposal.title = extendedData.title;
      proposal.calldatas = extendedData.calldatas;
      proposal.description = extendedData.description;
      proposal.signatures = extendedData.signatures;
      proposal.stateChanges = extendedData.stateChanges;
      proposal.subtitle = extendedData.subtitle;
      proposal.targets = extendedData.targets;
    }
  });
};

const extractProposalSubtitle = (input: string): string => {
  // Split the input into lines
  const lines = input.split("\n");

  // Find the first line that starts with a markdown H1 (#)
  const h1Line = lines.find((line) => line.startsWith("#"));

  if (!h1Line) {
    return input ? input.substring(0, 100) : "";
  }

  // Remove the leading '#' and trim whitespace
  let result = h1Line.substring(1).trim();

  // If there's a markdown H2 (##) in the line, get the text before it
  const h2Index = result.indexOf("##");
  if (h2Index !== -1) {
    result = result.substring(0, h2Index).trim();
  }

  // Remove any non-newline '\n' occurrences from the extracted text
  result = result.replace(/\\n/g, "").trim();

  // If the remaining text is longer than 80 characters, truncate it and add an ellipsis
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

  if (result.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0) {
    result = result.replace("Gauntlet", "MIP-R10: Gauntlet");
  }

  return result;
};

export const getProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  if (params.environment.contracts.core?.governor) {
    let count = 0n;
    let quorum = 0n;

    if (params.environment.chain.id === moonriver.id) {
      [count, quorum] = await Promise.all([
        params.environment.contracts.core.governor.read.proposalCount(),
        params.environment.contracts.core.governor.read.getQuorum(),
      ]);
    } else {
      [count, quorum] = await Promise.all([
        params.environment.contracts.core.governor.read.proposalCount(),
        params.environment.contracts.core.governor.read.quorumVotes(),
      ]);
    }

    //Id out of range
    if (params.id) {
      if (BigInt(params.id) > count) {
        return [];
      }
    }

    const ids = params.id ? [BigInt(params.id)] : Array.from({ length: Number(count) }, (_, i) => count - BigInt(i));

    const proposalDataCall = Promise.all(ids.map((id) => params.environment.contracts.core?.governor?.read.proposals([id])));

    const proposalStateCall = Promise.all(ids.map((id) => params.environment.contracts.core?.governor?.read.state([id])));

    const [proposalsData, proposalsState] = await Promise.all([proposalDataCall, proposalStateCall]);

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
        chainId: params.environment.chain.id,
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

export const getCrossChainProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  if (params.environment.contracts.core?.governor) {
    const xcGovernanceSettings = params.environment.settings?.governance;
    if (params.environment.contracts.core.multichainGovernor && xcGovernanceSettings && xcGovernanceSettings.chainIds.length > 0) {
      const xcEnvironments = xcGovernanceSettings.chainIds
        .map((chainId) => environments.find((env) => env.chain.id === chainId))
        .filter((xcEnvironment) => !!xcEnvironment)
        .filter((xcEnvironment) => xcEnvironment.chain.custom?.wormhole?.chainId && xcEnvironment.contracts.core?.voteCollector);

      const [xcCount, xcQuorum] = await Promise.all([
        params.environment.contracts.core.multichainGovernor.read.proposalCount(),
        params.environment.contracts.core.multichainGovernor.read.quorum(),
      ]);

      if (params.id) {
        //Fix proposal id
        params.id = Number(params.id) - (params.environment.settings?.governance?.proposalIdOffset || 0);

        if (params.id < 0) {
          return [];
        } else {
          if (BigInt(params.id) > xcCount) {
            return [];
          }
        }
      }

      const xcIds = params.id ? [BigInt(params.id)] : Array.from({ length: Number(xcCount) }, (_, i) => xcCount - BigInt(i));

      const xcProposalsDataCall = Promise.all(
        xcIds.map((id) => params.environment.contracts.core!.multichainGovernor?.read.proposals([id])),
      );

      const xcProposalsStateCall = Promise.all(xcIds.map((id) => params.environment.contracts.core!.multichainGovernor?.read.state([id])));

      const xcProposalsCollectedVotes = xcEnvironments.map((xcEnvironment) => {
        return Promise.all(
          xcIds.map((id) =>
            params.environment.contracts.core!.multichainGovernor!.read.chainVoteCollectorVotes([
              xcEnvironment.chain.custom!.wormhole!.chainId,
              id,
            ]),
          ),
        );
      });

      const xcProposalsVotes = xcEnvironments.map((xcEnvironment) => {
        return Promise.all(xcIds.map((id) => xcEnvironment.contracts.core!.voteCollector!.read.proposalVotes([id])));
      });

      const [xcProposalsData, xcProposalsState, xcCollectorVotes, xcVotes] = await Promise.all([
        xcProposalsDataCall,
        xcProposalsStateCall,
        Promise.all(xcProposalsCollectedVotes),
        Promise.all(xcProposalsVotes),
      ]);

      const proposals = xcIds.map((xcId, proposalIndex) => {
        const id = Number(xcId) + (params.environment.settings?.governance?.proposalIdOffset || 0);

        const state = xcProposalsState?.[proposalIndex]!;

        const votesCollected = xcCollectorVotes.reduce((prevCollected, currentCollected, i) => {
          const [votesFor, votesAgainst, votesAbstain] = currentCollected[proposalIndex]!;
          const collected = votesFor > 0n || votesAgainst > 0n || votesAbstain > 0n;

          return i === 0 ? collected : prevCollected === false ? false : collected;
        }, false);

        const votes = xcVotes.reduce(
          (prevVotes, currVotes) => {
            const [totalVotes, forVotes, againstVotes, abstainVotes] = currVotes[proposalIndex]!;

            return {
              totalVotes: prevVotes.totalVotes + totalVotes,
              forVotes: prevVotes.forVotes + forVotes,
              againstVotes: prevVotes.againstVotes + againstVotes,
              abstainVotes: prevVotes.abstainVotes + abstainVotes,
            };
          },
          { totalVotes: 0n, forVotes: 0n, againstVotes: 0n, abstainVotes: 0n },
        );

        const [
          proposer,
          _voteSnapshotTimestamp,
          votingStartTime,
          votingEndTime,
          crossChainVoteCollectionEndTimestamp,
          voteSnapshotBlock,
          forVotes,
          againstVotes,
          abstainVotes,
          totalVotes,
          canceled,
          executed,
        ] = xcProposalsData?.[proposalIndex]!;

        const multichainState = (MultichainProposalStateMapping as { [key: number]: ProposalState })[state]!;

        const proposal: Proposal = {
          chainId: params.environment.chain.id,
          id,
          proposalId: Number(xcId),
          proposer,
          eta: Number(crossChainVoteCollectionEndTimestamp),
          startTimestamp: Number(votingStartTime),
          endTimestamp: Number(votingEndTime),
          startBlock: Number(voteSnapshotBlock),
          forVotes: new Amount(forVotes + votes.forVotes, 18),
          againstVotes: new Amount(againstVotes + votes.againstVotes, 18),
          abstainVotes: new Amount(abstainVotes + votes.abstainVotes, 18),
          totalVotes: new Amount(totalVotes + votes.totalVotes, 18),
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

export const getExtendedProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  let result: ExtendedProposalData[] = [];
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
                messages: {
                  items: {
                    timestamp: number;
                    sequence: number;
                  }[];
                };
              }[];
            };
          }[];
        };
      };
    }>(params.environment.apis.indexerUrl, {
      query: `
          query {
            proposals(
              limit: 1000, 
              orderDirection: "desc", 
              orderBy: "proposalId", 
              where: { 
                chainId: ${params.environment.chain.id}
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
                    messages {
                      items {
                        timestamp
                        sequence
                      }
                    }
                  }
                }
              }
            }
          }
        `,
    });

    if (response.status === 200 && response.data?.data?.proposals) {
      const proposals = response.data.data.proposals.items.map((item) => {
        const extendedProposalData: ExtendedProposalData = {
          id: item.proposalId, //temp fix while ponder is outdated
          title: `Proposal #${item.proposalId}`, //temp fix while ponder is outdated
          subtitle: extractProposalSubtitle(item.description),
          description: item.description,
          calldatas: item.calldatas,
          signatures: item.signatures,
          stateChanges: item.stateChanges.items.map((change) => {
            return {
              blockNumber: change.blockNumber,
              messages: change.messages.items.map((message) => message),
              state: change.newState,
              transactionHash: change.txnHash,
            };
          }),
          targets: item.targets,
        };

        if (extendedProposalData.subtitle.includes("Moonbeam")) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-B", "MIP-M");
        }

        if (extendedProposalData.subtitle.indexOf("MIP-B22: Gauntlet") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-B22", "MIP-B24");
        }

        if (extendedProposalData.subtitle.indexOf("MIP-O01: Gauntlet") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-O01", "MIP-O03");
        }

        if (extendedProposalData.subtitle.indexOf("MIP-M02: Upgrade") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-M02", "MIP-M03");
        }

        if (extendedProposalData.subtitle.indexOf("MIP-R02: Upgrade") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-R02", "MIP-R03");
        }

        if (extendedProposalData.subtitle.indexOf("Proposal: Onboard wstETH") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("Proposal:", "MIP-B08");
        }

        if (extendedProposalData.subtitle.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("Gauntlet", "MIP-R10: Gauntlet");
        }

        if (extendedProposalData.description.substring(0, 9).includes("MIP-MIP")) {
          extendedProposalData.description = extendedProposalData.description.replace("MIP-", "");
        }

        if (extendedProposalData.subtitle.substring(0, 7).includes("MIP-MIP")) {
          extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-", "");
        }

        return extendedProposalData;
      });

      if (proposals.length < 1000 || proposals.length === 0) {
        shouldContinue = false;
      } else {
        lastId = _.last(proposals)!.id;
      }

      result = result.concat(proposals);
    }
  }

  return result;
};
