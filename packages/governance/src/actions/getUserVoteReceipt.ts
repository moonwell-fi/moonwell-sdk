import type { VoteReceipt } from "@/types/voteReceipt.js";
import { Amount, type MultichainReturnType } from "@moonwell-sdk/common";
import { type Environment, publicEnvironments } from "@moonwell-sdk/environments";

export type GetUserVoteReceiptReturnType = MultichainReturnType<VoteReceipt>;

export async function getUserVoteReceipt(params: {
  environment: Environment;
  id: number;
  account: `0x${string}`;
}): Promise<GetUserVoteReceiptReturnType | undefined> {
  let isMultichain = false;
  let proposalId = params.id;

  const result: GetUserVoteReceiptReturnType = {};

  if (params.environment.contracts.core?.multichainGovernor) {
    if (params.environment.settings?.governance?.proposalIdOffset) {
      if (params.id > params.environment.settings?.governance?.proposalIdOffset) {
        isMultichain = true;
        proposalId = params.id - params.environment.settings?.governance?.proposalIdOffset;
      }
    }
  }

  if (isMultichain) {
    const governanceChainIds = params.environment.settings?.governance?.chainIds || [];

    const receipt = await params.environment.contracts.core?.multichainGovernor?.read.getReceipt([BigInt(proposalId), params.account]);

    const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

    result[params.environment.chain.id] = {
      account: params.account,
      option: voteValue,
      voted: hasVoted,
      votes: new Amount(votes || 0, 18),
    };

    for (const chainId of governanceChainIds) {
      const multichainEnvironment = Object.values(publicEnvironments).find((r) => r.chain.id === chainId);
      if (multichainEnvironment) {
        const receipt = await multichainEnvironment.contracts.core?.voteCollector?.read.getReceipt([BigInt(proposalId), params.account]);

        const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];

        result[multichainEnvironment.chain.id] = {
          account: params.account,
          option: voteValue,
          voted: hasVoted,
          votes: new Amount(votes || 0, 18),
        };
      }
    }
  } else {
    const receipt = await params.environment.contracts.core?.governor?.read.getReceipt([BigInt(proposalId), params.account]);

    result[params.environment.chain.id] = {
      account: params.account,
      option: receipt?.voteValue || 0,
      voted: receipt?.hasVoted || false,
      votes: new Amount(receipt?.votes || 0, 18),
    };
  }

  return result;
}
