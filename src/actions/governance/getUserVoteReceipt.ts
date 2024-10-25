import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";
import type { VoteReceipt } from "../../types/voteReceipt.js";

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

  let isMultichain = false;
  let getReceiptProposalId = proposalId;

  if (environment.contracts.multichainGovernor) {
    if (environment.custom?.governance?.proposalIdOffset) {
      if (proposalId > environment.custom?.governance?.proposalIdOffset) {
        isMultichain = true;
        getReceiptProposalId =
          proposalId - environment.custom?.governance?.proposalIdOffset;
      }
    }
  }

  const result: VoteReceipt[] = [];

  if (isMultichain) {
    const governanceChainIds = environment.custom?.governance?.chainIds || [];

    const receipt =
      await environment.contracts.multichainGovernor?.read.getReceipt([
        BigInt(getReceiptProposalId),
        userAddress,
      ]);

    const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

    result.push({
      chainId: environment.chainId,
      proposalId,
      account: userAddress,
      option: voteValue,
      voted: hasVoted,
      votes: new Amount(votes || 0, 18),
    });

    for (const chainId of governanceChainIds) {
      const multichainEnvironment = (
        Object.values(publicEnvironments) as Environment[]
      ).find((r) => r.chainId === chainId);
      if (multichainEnvironment) {
        const receipt =
          await multichainEnvironment.contracts.voteCollector?.read.getReceipt([
            BigInt(getReceiptProposalId),
            userAddress,
          ]);

        const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

        result.push({
          chainId: multichainEnvironment.chainId,
          proposalId,
          account: userAddress,
          option: voteValue,
          voted: hasVoted,
          votes: new Amount(votes || 0, 18),
        });
      }
    }
  } else {
    const receipt = await environment.contracts.governor?.read.getReceipt([
      BigInt(getReceiptProposalId),
      userAddress,
    ]);

    result.push({
      chainId: environment.chainId,
      proposalId,
      account: userAddress,
      option: receipt?.voteValue || 0,
      voted: receipt?.hasVoted || false,
      votes: new Amount(receipt?.votes || 0, 18),
    });
  }

  return result;
}
