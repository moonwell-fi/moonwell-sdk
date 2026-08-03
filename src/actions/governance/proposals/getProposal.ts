import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import { type Proposal, ProposalState } from "../../../types/proposal.js";
import {
  type ApiProposal,
  MULTIGOV_PROPOSAL_FALLBACK_CHAIN_IDS,
  fetchProposal,
  isNotFoundError,
} from "../governor-api-client.js";
import { resolveIpfsDescriptions } from "../ipfs.js";
import {
  formatApiProposalData,
  getProposalsOnChainData,
  readCrossChainQuorums,
  resolveGovernanceEnvironment,
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

  // `args.chainId` identifies the chain the PROPOSAL lives on, which is no longer
  // the same thing as the environment we read through. Before the sunset it was
  // both, and the action resolved a Moonbeam/Moonriver environment from it —
  // which now means a `chainId: 1284` lookup would resolve nothing and the whole
  // historical archive would 404 (MOO-551). Resolve the indexer source
  // independently and pass `chainId` through untouched.
  const governanceEnvironment = resolveGovernanceEnvironment(
    Object.values(client.environments as Record<string, Environment>),
  );
  if (!governanceEnvironment) {
    return undefined;
  }

  return getGovernorApiProposal(
    governanceEnvironment,
    proposalId,
    args.chainId,
  );
}

/**
 * Fetch a single proposal from the Governor API (Moonbeam/Ethereum multigov or
 * Moonriver legacy governor).
 *
 * When `chainId` is provided we hit only that chain. When omitted we try the
 * multigov chains in order (Ethereum first since that's where active multigov
 * proposals live) and fall back on `NotFoundError`. Moonriver (1285) is
 * deliberately absent from the fallback — it has its own explicit route, and a
 * bare lookup resolving to it through a non-Moonriver env would be degraded.
 * Real outages (5xx, network errors) propagate so callers can distinguish
 * "missing" from "broken".
 */
async function getGovernorApiProposal(
  governanceEnvironment: Environment,
  proposalId: number,
  chainId?: number,
): Promise<Proposal | undefined> {
  const tryChains = chainId ? [chainId] : MULTIGOV_PROPOSAL_FALLBACK_CHAIN_IDS;

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
    // Legacy-governor proposals (Moonriver, early Moonbeam) carry the function
    // signature separately from the selector-less calldata; pass it through so
    // consumers can decode the call. Empty for multichain-governor proposals.
    signatures: apiProposal.signatures ?? [],
    stateChanges: formattedData.stateChanges,
    environment: governanceEnvironment,
  };

  if (apiProposal.snapshotBlocks) {
    proposal.snapshotBlocks = apiProposal.snapshotBlocks;
  }

  if (isMultichain) {
    proposal.multichain = {
      id: apiProposal.proposalId,
      votesCollected: onChainData.votesCollected,
    };
  }

  return proposal;
}
