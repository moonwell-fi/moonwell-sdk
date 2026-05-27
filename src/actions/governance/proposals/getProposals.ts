import { moonbeam, moonriver } from "viem/chains";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import { type Proposal, ProposalState } from "../../../types/proposal.js";
import { type ApiProposal, fetchAllProposals } from "../governor-api-client.js";
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
 * Fetch proposals for Moonbeam using the Governor API.
 *
 * The same indexer DO serves two chains:
 *   - chainId=1 (Ethereum) — the active multigov contract
 *   - chainId=1284 (Moonbeam) — historical proposals
 *
 * Uses `Promise.allSettled` so a transient outage on one chain doesn't take
 * down the other — partial results are preferred over a hard failure.
 */
async function getMoonbeamProposals(
  governanceEnvironment: Environment,
): Promise<Proposal[]> {
  const results = await Promise.allSettled([
    fetchAllProposals(governanceEnvironment, { chainId: 1 }),
    fetchAllProposals(governanceEnvironment, { chainId: 1284 }),
  ]);

  const chainsAttempted: ReadonlyArray<1 | 1284> = [1, 1284];
  const apiProposals: ApiProposal[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      apiProposals.push(...result.value);
    } else {
      console.warn(
        `[getProposals] Failed to fetch proposals for chainId=${chainsAttempted[index]}; continuing with remaining chains.`,
        result.reason,
      );
    }
  });

  const crossChainQuorums = await readCrossChainQuorums(
    apiProposals,
    governanceEnvironment,
  );
  const onChainDataList = await getProposalsOnChainData(
    apiProposals,
    governanceEnvironment,
    { crossChainQuorums },
  );

  const proposals: Proposal[] = apiProposals.map((apiProposal, index) => {
    const onChainData = onChainDataList[index]!;
    const formattedData = formatApiProposalData(apiProposal);
    const isMultichain = isMultichainProposal(apiProposal.targets);

    // `onChainData.state` is already API-derived for cross-chain proposals
    // (handled inside getProposalsOnChainData), so the post-processing below
    // is a no-op for them — derived states already reflect executed/canceled/
    // queued/active/pending, and votesCollected is false so the Queued branch
    // never fires.
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
