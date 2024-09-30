import { Amount, type MultichainReturnType } from "../../common/index.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";
import type { VoteReceipt } from "../types/voteReceipt.js";

export type GetUserVoteReceiptReturnType = MultichainReturnType<VoteReceipt>;

export async function getUserVoteReceipt(params: {
  environment: Environment;
  id: number;
  account: `0x${string}`;
}): Promise<GetUserVoteReceiptReturnType | undefined> {
  let isMultichain = false;
  let proposalId = params.id;

  const result: GetUserVoteReceiptReturnType = {};

  if (params.environment.contracts.multichainGovernor) {
    if (params.environment.custom?.governance?.proposalIdOffset) {
      if (params.id > params.environment.custom?.governance?.proposalIdOffset) {
        isMultichain = true;
        proposalId =
          params.id - params.environment.custom?.governance?.proposalIdOffset;
      }
    }
  }

  if (isMultichain) {
    const governanceChainIds =
      params.environment.custom?.governance?.chainIds || [];

    const receipt =
      await params.environment.contracts.multichainGovernor?.read.getReceipt([
        BigInt(proposalId),
        params.account,
      ]);

    const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

    result[params.environment.chainId] = {
      account: params.account,
      option: voteValue,
      voted: hasVoted,
      votes: new Amount(votes || 0, 18),
    };

    for (const chainId of governanceChainIds) {
      const multichainEnvironment = (
        Object.values(publicEnvironments) as Environment[]
      ).find((r) => r.chainId === chainId);
      if (multichainEnvironment) {
        const receipt =
          await multichainEnvironment.contracts.voteCollector?.read.getReceipt([
            BigInt(proposalId),
            params.account,
          ]);

        const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

        result[multichainEnvironment.chainId] = {
          account: params.account,
          option: voteValue,
          voted: hasVoted,
          votes: new Amount(votes || 0, 18),
        };
      }
    }
  } else {
    const receipt =
      await params.environment.contracts.governor?.read.getReceipt([
        BigInt(proposalId),
        params.account,
      ]);

    result[params.environment.chainId] = {
      account: params.account,
      option: receipt?.voteValue || 0,
      voted: receipt?.hasVoted || false,
      votes: new Amount(receipt?.votes || 0, 18),
    };
  }

  return result;
}
