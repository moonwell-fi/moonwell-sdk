import axios from "axios";
import { moonbeam, moonriver } from "viem/chains";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { Proposal } from "../../../types/proposal.js";
import { type ApiProposal, fetchProposal } from "../governor-api-client.js";
import {
  appendProposalExtendedData,
  deriveProposalStateFromApi,
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
  /**
   * The chain the proposal lives on (1 = Ethereum multigov,
   * 1284 = Moonbeam historical). When omitted, both are tried in turn.
   */
  chainId?: number;
};

export type GetProposalReturnType = Promise<Proposal | undefined>;

// Chains tried (in order) when caller omits chainId. Ethereum first because
// new multigov proposals live there; Moonbeam covers the historical archive.
const FALLBACK_CHAIN_IDS = [1, 1284] as const;

const is404 = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

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

  if (
    environment.chainId !== moonbeam.id &&
    environment.chainId !== moonriver.id
  ) {
    return undefined;
  }

  try {
    if (environment.chainId === moonbeam.id) {
      // Moonbeam: Use new Governor API
      return await getMoonbeamProposal(environment, proposalId, args.chainId);
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
  governanceEnvironment: Environment,
  proposalId: number,
  chainId?: number,
): Promise<Proposal | undefined> {
  const tryChains = chainId ? [chainId] : FALLBACK_CHAIN_IDS;

  let apiProposal: ApiProposal | undefined;
  let lastError: unknown;
  for (const cid of tryChains) {
    try {
      apiProposal = await fetchProposal(governanceEnvironment, cid, proposalId);
      break;
    } catch (error) {
      lastError = error;
      if (is404(error)) continue;
      throw error;
    }
  }

  if (!apiProposal) {
    if (lastError && !is404(lastError)) throw lastError;
    return undefined;
  }

  const formattedData = formatApiProposalData(apiProposal);
  const onChainDataList = await getProposalsOnChainData(
    [apiProposal],
    governanceEnvironment,
  );
  const onChainData = onChainDataList[0]!;

  const now = Math.floor(Date.now() / 1000);
  const isCrossChainProposal =
    apiProposal.chainId !== governanceEnvironment.chainId;
  const isMultichain = isMultichainProposal(apiProposal.targets);

  let proposalState: number;
  if (isCrossChainProposal) {
    proposalState = deriveProposalStateFromApi(formattedData, apiProposal, now);
  } else {
    proposalState = onChainData.state;

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
  governanceEnvironment: Environment,
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
