import { mainnet, moonbeam, moonriver } from "viem/chains";
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
  formatApiProposalData,
  getProposalsOnChainData,
  readCrossChainQuorums,
} from "./common.js";

export type GetProposalParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  proposalId: number;
  /**
   * The chain the proposal lives on (1 = Ethereum multigov,
   * 1284 = Moonbeam historical, 1285 = Moonriver legacy). When omitted, the
   * supported chains are tried in turn.
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

  // Ethereum-home multigov proposals are served by the same Governor API as
  // historical Moonbeam ones (the lunar indexer fans out both chainIds), so
  // route them through `getGovernorApiProposal` using the Moonbeam env as the
  // indexer source. Without this, a caller resolving the env by `chainId: 1`
  // would bail out on the `!moonbeam && !moonriver` check below and the page
  // reload path returns undefined.
  if (environment.chainId === mainnet.id) {
    const moonbeamEnv = Object.values(
      client.environments as Record<string, Environment>,
    ).find((e) => e.chainId === moonbeam.id);
    if (!moonbeamEnv) {
      return undefined;
    }
    return getGovernorApiProposal(
      moonbeamEnv,
      proposalId,
      args.chainId ?? mainnet.id,
    );
  }

  if (
    environment.chainId !== moonbeam.id &&
    environment.chainId !== moonriver.id
  ) {
    return undefined;
  }

  if (environment.chainId === moonbeam.id) {
    return getGovernorApiProposal(environment, proposalId, args.chainId);
  }
  return getGovernorApiProposal(environment, proposalId, moonriver.id);
}

/**
 * Fetch a single proposal from the Governor API (Moonbeam/Ethereum multigov or
 * Moonriver legacy governor).
 *
 * When `chainId` is provided we hit only that chain. When omitted we try the
 * supported chains in order (Ethereum first since that's where active multigov
 * proposals live) and fall back on `NotFoundError`. Real outages (5xx, network
 * errors) propagate so callers can distinguish "missing" from "broken".
 */
async function getGovernorApiProposal(
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
  // Single source of truth: getProposalsOnChainData already classified this
  // proposal with the caller env's Artemis cutoff and used it to route the
  // on-chain reads. Reusing it avoids the drift that left Moonbeam-homed
  // local-target proposals (and hub-local Ethereum ones) without `multichain`.
  const isMultichain = onChainData.isMultichain;

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
    proposalState === ProposalState.Succeeded
  ) {
    // Succeeded with collection done means "awaiting execution" — surface as
    // Queued so the frontend renders the "Ready to Execute" timeline step.
    // Defeated/Canceled/Executed must NOT be promoted: under the new
    // state-machine-based votesCollected, those terminal states also satisfy
    // `votesCollected: true`, so a `< Queued` gate would mislabel them.
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
