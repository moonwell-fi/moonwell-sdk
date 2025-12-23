import { moonbeam, moonriver } from "viem/chains";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import type { Proposal } from "../../../types/proposal.js";
import { fetchAllProposals } from "../governor-api-client.js";
import {
  appendProposalExtendedData,
  formatApiProposalData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
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
  client: MoonwellClient,
  args?: GetProposalsParameters<environments, Network>,
): GetProposalsReturnType {
  const logId = logger.start("getProposals", "Starting to get proposals...");

  const environments = getEnvironmentsFromArgs(client, args);

  const governanceEnvironments = environments.filter(
    (environment) =>
      environment.chainId === moonbeam.id ||
      environment.chainId === moonriver.id,
  );

  if (governanceEnvironments.length === 0) {
    logger.end(logId);
    return [];
  }

  const allProposals = await Promise.all(
    governanceEnvironments.map(async (governanceEnvironment) => {
      if (governanceEnvironment.chainId === moonbeam.id) {
        // Moonbeam: Use new Governor API
        return getMoonbeamProposals(governanceEnvironment);
      } else {
        // Moonriver: Use old Ponder approach
        return getMoonriverProposals(governanceEnvironment);
      }
    }),
  );

  const proposals = allProposals.flat();
  const sortedProposals = proposals.sort((a, b) => b.proposalId - a.proposalId);

  logger.end(logId);

  return sortedProposals;
}

/**
 * Fetch proposals for Moonbeam using the new Governor API
 */
async function getMoonbeamProposals(
  governanceEnvironment: Environment,
): Promise<Proposal[]> {
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

  return proposals;
}

/**
 * Fetch proposals for Moonriver using the old Ponder-based approach
 */
async function getMoonriverProposals(
  governanceEnvironment: Environment,
): Promise<Proposal[]> {
  const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
    getProposalData({ environment: governanceEnvironment }),
    getCrossChainProposalData({ environment: governanceEnvironment }),
    getExtendedProposalData({ environment: governanceEnvironment }),
  ]);

  const proposals = [..._proposals, ..._xcProposals];

  proposals.forEach((proposal) => {
    proposal.environment = governanceEnvironment;
  });

  appendProposalExtendedData(proposals, _extendedDatas);

  return proposals;
}
