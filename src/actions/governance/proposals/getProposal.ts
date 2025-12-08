import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import { type Chain, publicEnvironments } from "../../../environments/index.js";
import type { Proposal } from "../../../types/proposal.js";
import { fetchProposal } from "../governor-api-client.js";
import {
  formatApiProposalData,
  getProposalsOnChainData,
  isMultichainProposal,
} from "./common.js";

export type GetProposalParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  proposalId: number;
};

export type GetProposalReturnType = Promise<Proposal | undefined>;

export async function getProposal<
  environments,
  Network extends Chain | undefined,
>(
  _client: MoonwellClient,
  args: GetProposalParameters<environments, Network>,
): GetProposalReturnType {
  const { proposalId } = args;

  const governanceEnvironment = publicEnvironments.moonbeam;

  const environment = getEnvironmentFromArgs(_client, args);
  if (!environment) {
    return undefined;
  }

  const apiProposalId = `${proposalId}`;

  try {
    const apiProposal = await fetchProposal(
      governanceEnvironment,
      apiProposalId,
    );

    const formattedData = formatApiProposalData(apiProposal);
    const onChainDataList = await getProposalsOnChainData(
      [apiProposal],
      governanceEnvironment,
    );
    const onChainData = onChainDataList[0]!;

    const isMultichain = isMultichainProposal(apiProposal.targets);

    let proposalState = onChainData.state;
    const now = Math.floor(Date.now() / 1000);

    if (
      proposalState === 0 &&
      now >= apiProposal.votingStartTime &&
      now <= apiProposal.votingEndTime
    ) {
      proposalState = 1; // Active
    }

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
  } catch (error) {
    console.error(
      `[getProposal] Error fetching proposal ${apiProposalId}:`,
      error,
    );
    return undefined;
  }
}
