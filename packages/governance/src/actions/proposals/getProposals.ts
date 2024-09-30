import type { Proposal } from "@/types/proposal.js";
import type { MultichainReturnType } from "@moonwell-sdk/common";
import type { Environment } from "@moonwell-sdk/environments";
import _ from "lodash";
import { appendProposalExtendedData, getCrossChainProposalData, getExtendedProposalData, getProposalData } from "./common.js";

export type GetProposalsReturnType = MultichainReturnType<Proposal[]>;

export async function getProposals(params: {
  environments: Environment[];
}): Promise<GetProposalsReturnType> {
  const envs = params.environments;

  try {
    const environmentProposals = await Promise.all(
      envs.map((environment) =>
        Promise.all([
          getProposalData({ environment }),
          getCrossChainProposalData({ environment }),
          getExtendedProposalData({ environment }),
        ]),
      ),
    );

    const proposals = envs.reduce((prev, curr, index) => {
      const [_proposals, _xcProposals, _extendedDatas] = environmentProposals[index]!;

      const proposals = [..._proposals, ..._xcProposals];

      appendProposalExtendedData(proposals, _extendedDatas);

      return {
        ...prev,
        [curr.chainId]: proposals,
      };
    }, {} as GetProposalsReturnType);

    return proposals;
  } catch (ex) {
    console.error("An error occured while fetching proposals...", ex);
    return {};
  }
}
