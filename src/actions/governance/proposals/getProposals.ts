import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import type { Proposal } from "../../../types/proposal.js";
import {
  type ApiProposal,
  SUPPORTED_GOVERNOR_CHAIN_IDS,
  fetchAllProposals,
} from "../governor-api-client.js";
import { resolveIpfsDescriptions } from "../ipfs.js";
import {
  getProposalsOnChainData,
  mapApiProposalToProposal,
  readCrossChainQuorums,
  resolveGovernanceEnvironment,
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

  const governanceEnvironment = resolveGovernanceEnvironment(environments);

  if (!governanceEnvironment) {
    logger.end(logId);
    return [];
  }

  const proposals = await fetchGovernorProposals(governanceEnvironment);
  // Newer multigov-ethereum proposals (chainId=1) and historical Moonbeam
  // proposals (chainId=1284) restart their proposalId counters from 1, so IDs
  // may collide across chains. Sort by proposalId desc with chainId as a
  // stable tiebreaker (smaller chainId — Ethereum — wins).
  const sortedProposals = proposals.sort((a, b) => {
    if (b.proposalId !== a.proposalId) return b.proposalId - a.proposalId;
    return a.chainId - b.chainId;
  });

  logger.end(logId);

  return sortedProposals;
}

/**
 * Fetch every proposal the Governor API serves, across all governance chains.
 *
 * One indexer DO serves them all:
 *   - chainId=1    (Ethereum)  — the active multigov contract
 *   - chainId=1284 (Moonbeam)  — historical archive, chain halted
 *   - chainId=1285 (Moonriver) — legacy Apollo governor, chain halted
 *
 * The sunset chains keep appearing here on purpose: the indexer still has their
 * proposals even though no RPC exists for them any more, so the governance
 * record stays readable (MOO-551). What they lose is the on-chain half —
 * `getProposalsOnChainData` finds no environment for 1284/1285 and derives their
 * state from indexer events, leaving quorum and eta unset.
 *
 * `Promise.allSettled` so one chain's outage degrades to a missing slice rather
 * than an empty list.
 */
async function fetchGovernorProposals(
  governanceEnvironment: Environment,
): Promise<Proposal[]> {
  const results = await Promise.allSettled(
    SUPPORTED_GOVERNOR_CHAIN_IDS.map((chainId) =>
      fetchAllProposals(governanceEnvironment, { chainId }),
    ),
  );

  const apiProposals: ApiProposal[] = [];
  results.forEach((result, index) => {
    const chainId = SUPPORTED_GOVERNOR_CHAIN_IDS[index];
    if (result.status === "fulfilled") {
      apiProposals.push(...result.value);
    } else if (chainId !== undefined) {
      console.warn(
        `[getProposals] Failed to fetch proposals for chainId=${chainId}; continuing with remaining chains.`,
        result.reason,
      );
      governanceEnvironment.onError?.(result.reason, {
        source: "governance-proposals",
        chainId,
      });
    }
  });

  return buildProposals(apiProposals, governanceEnvironment);
}

/**
 * Shared Governor-API pipeline: resolve IPFS descriptions + cross-chain quorums
 * in parallel, read on-chain data, then map each ApiProposal to a Proposal.
 * Used by both the Moonbeam/Ethereum and Moonriver paths so the mapping stays
 * in one place.
 */
async function buildProposals(
  apiProposals: ApiProposal[],
  governanceEnvironment: Environment,
): Promise<Proposal[]> {
  // IPFS resolution and cross-chain quorum reads are independent — run them in
  // parallel to save one network round-trip on the proposal list path.
  const [, crossChainQuorums] = await Promise.all([
    resolveIpfsDescriptions(apiProposals, governanceEnvironment),
    readCrossChainQuorums(apiProposals, governanceEnvironment),
  ]);
  const onChainDataList = await getProposalsOnChainData(
    apiProposals,
    governanceEnvironment,
    { crossChainQuorums },
  );

  const proposals: Proposal[] = apiProposals.map((apiProposal, index) =>
    mapApiProposalToProposal(
      apiProposal,
      onChainDataList[index]!,
      governanceEnvironment,
    ),
  );

  return proposals;
}
