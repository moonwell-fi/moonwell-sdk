import { moonbeam, moonriver } from "viem/chains";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import { type Proposal, ProposalState } from "../../../types/proposal.js";
import {
  type ApiProposal,
  SUPPORTED_GOVERNOR_CHAIN_IDS,
  fetchProposal,
  isNotFoundError,
} from "../governor-api-client.js";
import { resolveIpfsDescriptions } from "../ipfs.js";
import {
  appendProposalExtendedData,
  formatApiProposalData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
  getProposalsOnChainData,
  isMultichainProposal,
  readCrossChainQuorums,
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

  if (environment.chainId === moonbeam.id) {
    return getMoonbeamProposal(environment, proposalId, args.chainId);
  }
  return getMoonriverProposal(environment, proposalId);
}

/**
 * Fetch a single proposal for Moonbeam using the Governor API.
 *
 * When `chainId` is provided we hit only that chain. When omitted we try the
 * supported chains in order (Ethereum first since that's where active multigov
 * proposals live) and fall back on `NotFoundError`. Real outages (5xx, network
 * errors) propagate so callers can distinguish "missing" from "broken".
 */
async function getMoonbeamProposal(
  governanceEnvironment: Environment,
  proposalId: number,
  chainId?: number,
): Promise<Proposal | undefined> {
  const tryChains = chainId ? [chainId] : SUPPORTED_GOVERNOR_CHAIN_IDS;

  let apiProposal: ApiProposal | undefined;
  for (const cid of tryChains) {
    try {
      apiProposal = await fetchProposal(governanceEnvironment, cid, proposalId);
      break;
    } catch (error) {
      if (isNotFoundError(error)) continue;
      throw error;
    }
  }

  if (!apiProposal) {
    return undefined;
  }

  const [, crossChainQuorums] = await Promise.all([
    resolveIpfsDescriptions([apiProposal], governanceEnvironment),
    readCrossChainQuorums([apiProposal], governanceEnvironment),
  ]);

  const formattedData = formatApiProposalData(apiProposal);
  const onChainDataList = await getProposalsOnChainData(
    [apiProposal],
    governanceEnvironment,
    { crossChainQuorums },
  );
  const onChainData = onChainDataList[0]!;
  const isMultichain = isMultichainProposal(apiProposal.targets);

  // For cross-chain proposals, onChainData.state is already API-derived inside
  // getProposalsOnChainData, so the post-processing below acts as a no-op
  // (votesCollected is false and the derived state is already terminal).
  const now = Math.floor(Date.now() / 1000);
  let proposalState = onChainData.state;

  if (
    proposalState === ProposalState.Pending &&
    now >= apiProposal.votingStartTime &&
    now <= apiProposal.votingEndTime
  ) {
    proposalState = ProposalState.Active;
  }

  if (formattedData.executed) {
    proposalState = ProposalState.Executed;
  } else if (
    isMultichain &&
    onChainData.votesCollected &&
    now > apiProposal.votingEndTime &&
    proposalState < ProposalState.Queued
  ) {
    proposalState = ProposalState.Queued;
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
