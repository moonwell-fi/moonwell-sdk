import axios from "axios";
import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { VoteReceipt } from "../../types/voteReceipt.js";
import {
  type ApiVoteReceipt,
  fetchUserVoteReceipt,
} from "./governor-api-client.js";

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
   * 1284 = Moonbeam historical). When omitted, both are tried in turn.
   */
  chainId?: number;
};

export type GetUserVoteReceiptReturnType = Promise<VoteReceipt[]>;

const FALLBACK_CHAIN_IDS = [1, 1284] as const;

const is404 = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export async function getUserVoteReceipt<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserVoteReceiptParameters<environments, Network>,
): GetUserVoteReceiptReturnType {
  const { proposalId, userAddress, chainId } = args;

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  try {
    const tryChains = chainId ? [chainId] : FALLBACK_CHAIN_IDS;

    let apiVoteReceipts: ApiVoteReceipt[] | undefined;
    let lastError: unknown;
    for (const cid of tryChains) {
      try {
        apiVoteReceipts = await fetchUserVoteReceipt(
          environment,
          cid,
          proposalId,
          userAddress,
        );
        break;
      } catch (error) {
        lastError = error;
        if (is404(error)) continue;
        throw error;
      }
    }

    if (!apiVoteReceipts) {
      if (lastError && !is404(lastError)) throw lastError;
      apiVoteReceipts = [];
    }

    if (apiVoteReceipts.length === 0) {
      return [
        {
          chainId: environment.chainId,
          proposalId,
          account: userAddress,
          voted: false,
          option: 0,
          votes: new Amount(0, 18),
        },
      ];
    }

    return apiVoteReceipts.map((apiReceipt) => ({
      chainId: apiReceipt.chainId,
      proposalId,
      account: userAddress as Address,
      voted: true,
      option: apiReceipt.voteValue,
      votes: new Amount(BigInt(apiReceipt.votes), 18),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch user vote receipt: ${message}`);
  }
}
