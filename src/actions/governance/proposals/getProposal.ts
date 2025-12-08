import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { Proposal } from "../../../types/proposal.js";
import { fetchProposal } from "../governor-api-client.js";
import {
  appendProposalExtendedData,
  formatApiProposalData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
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
  client: MoonwellClient,
  args: GetProposalParameters<environments, Network>,
): GetProposalReturnType {
  const { proposalId } = args;

  const environment = getEnvironmentFromArgs(client, args);
  if (!environment) {
    return undefined;
  }

  if (environment.chainId !== 1284 && environment.chainId !== 1285) {
    return undefined;
  }

  try {
    if (environment.chainId === 1284) {
      // Moonbeam: Use new Governor API
      return await getMoonbeamProposal(environment, proposalId);
    } else {
      // Moonriver: Use old Ponder approach
      return await getMoonriverProposal(environment, proposalId);
    }
  } catch (error) {
    console.error(
      `[getProposal] Error fetching proposal ${proposalId}:`,
      error,
    );
    return undefined;
  }
}

/**
 * Fetch a single proposal for Moonbeam using the new Governor API
 */
async function getMoonbeamProposal(
  governanceEnvironment: any,
  proposalId: number,
): Promise<Proposal | undefined> {
  const apiProposalId = `${proposalId}`;

  const apiProposal = await fetchProposal(governanceEnvironment, apiProposalId);

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
}

/**
 * Fetch a single proposal for Moonriver using the old Ponder-based approach
 */
async function getMoonriverProposal(
  governanceEnvironment: any,
  proposalId: number,
): Promise<Proposal | undefined> {
  const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
    getProposalData({ environment: governanceEnvironment, id: proposalId }),
    getCrossChainProposalData({
      environment: governanceEnvironment,
      id: proposalId,
    }),
    getExtendedProposalData({
      environment: governanceEnvironment,
      id: proposalId,
    }),
  ]);

  const proposals = [..._proposals, ..._xcProposals];

  proposals.forEach((proposal) => {
    proposal.environment = governanceEnvironment;
  });

  appendProposalExtendedData(proposals, _extendedDatas);

  return proposals.find(
    (p) => p.proposalId === proposalId || p.id === proposalId,
  );
}
