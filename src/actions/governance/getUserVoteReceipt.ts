import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { Environment } from "../../environments/index.js";
import type { VoteReceipt } from "../../types/voteReceipt.js";
import {
  type ApiVoteReceipt,
  GovernorNotFoundError,
  SUPPORTED_GOVERNOR_CHAIN_IDS,
  fetchUserVoteReceipt,
  isNotFoundError,
} from "./governor-api-client.js";
import { resolveGovernanceEnvironment } from "./proposals/common.js";

export type GetUserVoteReceiptParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** Id of the proposal */
  proposalId: number;

  /** User address*/
  userAddress: Address;

  /**
   * The chain the proposal lives on (1 = Ethereum multigov,
   * 1284 = Moonbeam historical, 1285 = Moonriver legacy). When omitted, every
   * supported chain is queried and non-empty receipts are concatenated —
   * proposalIds may collide across chains (they represent different proposals),
   * so a single bare proposalId can have votes on more than one chain.
   */
  chainId?: number;
};

export type GetUserVoteReceiptReturnType = Promise<VoteReceipt[]>;

/**
 * Fetch a user's vote receipts for a proposal.
 *
 * Returns the "didn't vote" stub when the proposal exists on at least one
 * queried chain but the user hasn't voted there. Throws `GovernorNotFoundError`
 * when the proposal doesn't exist on any queried chain — callers can use that
 * to distinguish "the user didn't vote" from "this proposal isn't visible".
 */
export async function getUserVoteReceipt<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserVoteReceiptParameters<environments, Network>,
): GetUserVoteReceiptReturnType {
  const { proposalId, userAddress, chainId } = args;

  // `args.chainId` identifies the chain the PROPOSAL lives on, not the
  // environment we read through — the same distinction `getProposal` draws
  // (MOO-551). Resolving the environment from it meant an archive lookup
  // (1284/1285) matched no registered environment post-sunset and returned `[]`,
  // a third shape callers don't handle: every historical vote read as "didn't
  // vote". Resolve the indexer source independently and pass `chainId` through
  // untouched.
  const governanceEnvironment = resolveGovernanceEnvironment(
    Object.values(client.environments as Record<string, Environment>),
  );
  if (!governanceEnvironment) {
    return [];
  }

  const tryChains = chainId ? [chainId] : SUPPORTED_GOVERNOR_CHAIN_IDS;

  const collected: ApiVoteReceipt[] = [];
  let anyChainAcknowledged = false;
  const notFoundChainIds: number[] = [];

  for (const cid of tryChains) {
    try {
      const apiVoteReceipts = await fetchUserVoteReceipt(
        governanceEnvironment,
        cid,
        proposalId,
        userAddress,
      );
      anyChainAcknowledged = true;
      collected.push(...apiVoteReceipts);
    } catch (error) {
      if (isNotFoundError(error)) {
        notFoundChainIds.push(cid);
        continue;
      }
      throw error;
    }
  }

  if (!anyChainAcknowledged) {
    throw new GovernorNotFoundError(notFoundChainIds[0] ?? 0, proposalId);
  }

  if (collected.length === 0) {
    return [
      {
        // An explicit request names the chain the stub is about; a bare lookup
        // queried every supported chain, so the source we read through is the
        // only chain it can honestly claim.
        chainId: chainId ?? governanceEnvironment.chainId,
        proposalId,
        account: userAddress,
        voted: false,
        option: 0,
        votes: new Amount(0, 18),
      },
    ];
  }

  return collected.map((apiReceipt) => ({
    chainId: apiReceipt.chainId,
    proposalId,
    account: userAddress,
    voted: true,
    option: apiReceipt.voteValue,
    votes: new Amount(BigInt(apiReceipt.votes), 18),
  }));
}
