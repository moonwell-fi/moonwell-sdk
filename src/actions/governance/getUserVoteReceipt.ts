import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { VoteReceipt } from "../../types/voteReceipt.js";
import { fetchUserVoteReceipt } from "./governor-api-client.js";

export type GetUserVoteReceiptParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** Id of the proposal */
  proposalId: number;

  /** User address*/
  userAddress: Address;
};

export type GetUserVoteReceiptReturnType = Promise<VoteReceipt[]>;

export async function getUserVoteReceipt<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserVoteReceiptParameters<environments, Network>,
): GetUserVoteReceiptReturnType {
  const { proposalId, userAddress } = args;

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  try {
    const apiVoteReceipts = await fetchUserVoteReceipt(
      environment,
      `${proposalId}`,
      userAddress,
    );

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
