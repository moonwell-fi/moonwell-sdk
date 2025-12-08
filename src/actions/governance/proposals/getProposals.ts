import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import { type Chain, publicEnvironments } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import type { Proposal } from "../../../types/proposal.js";
import { fetchAllProposals } from "../governor-api-client.js";
import {
  formatApiProposalData,
  getProposalsOnChainData,
  isMultichainProposal,
} from "./common.js";

export type GetProposalsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network>;

export type GetProposalsReturnType = Promise<Proposal[]>;

export async function getProposals<
  environments,
  Network extends Chain | undefined,
>(
  _client: MoonwellClient,
  _args?: GetProposalsParameters<environments, Network>,
): GetProposalsReturnType {
  const logId = logger.start(
    "getProposals",
    "Starting to get proposals from Governor API...",
  );

  const governanceEnvironment = publicEnvironments.moonbeam;

  const apiProposals = await fetchAllProposals(governanceEnvironment);
  const onChainDataList = await getProposalsOnChainData(
    apiProposals,
    governanceEnvironment,
  );

  const proposals: Proposal[] = apiProposals.map((apiProposal, index) => {
    const onChainData = onChainDataList[index]!;

    const formattedData = formatApiProposalData(apiProposal);

    let proposalState = onChainData.state;
    const now = Math.floor(Date.now() / 1000);

    if (
      proposalState === 0 &&
      now >= apiProposal.votingStartTime &&
      now <= apiProposal.votingEndTime
    ) {
      proposalState = 1; // Active
    }

    const isMultichain = isMultichainProposal(apiProposal.targets);

    if (formattedData.executed) {
      proposalState = 7; // ProposalState.Executed
    } else if (
      isMultichain &&
      onChainData.votesCollected &&
      now > apiProposal.votingEndTime &&
      proposalState < 5
    ) {
      proposalState = 5; // ProposalState.Queued
    }

    const proposal: Proposal = {
      id: apiProposal.proposalId,
      chainId: apiProposal.chainId,
      proposalId: apiProposal.proposalId,
      proposer: apiProposal.proposer as `0x${string}`,
      eta: onChainData.eta,
      startTimestamp: apiProposal.votingStartTime,
      endTimestamp: apiProposal.votingEndTime,
      startBlock: Number(apiProposal.blockNumber),
      forVotes: formattedData.forVotes,
      againstVotes: formattedData.againstVotes,
      abstainVotes: formattedData.abstainVotes,
      totalVotes: formattedData.totalVotes,
      canceled: formattedData.canceled,
      executed: formattedData.executed,
      quorum: new Amount(onChainData.quorum, 18),
      state: proposalState,
      // Extended data
      title: formattedData.title,
      subtitle: formattedData.subtitle,
      description: apiProposal.description,
      targets: apiProposal.targets,
      calldatas: apiProposal.calldatas,
      signatures: [],
      stateChanges: formattedData.stateChanges,
      environment: governanceEnvironment,
    };

    if (isMultichain) {
      proposal.multichain = {
        id: apiProposal.proposalId,
        votesCollected: onChainData.votesCollected,
      };
    }

    return proposal;
  });

  const sortedProposals = proposals.sort((a, b) => b.proposalId - a.proposalId);

  logger.end(logId);

  return sortedProposals;
}
