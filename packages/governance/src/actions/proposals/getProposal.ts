import type { Proposal } from "@/types/proposal.js";
import type { Environment } from "@moonwell-sdk/environments";
import _ from "lodash";
import { appendProposalExtendedData, getCrossChainProposalData, getExtendedProposalData, getProposalData } from "./common.js";

export async function getProposal(params: {
  environment: Environment;
  id: number;
}): Promise<Proposal | undefined> {
  const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
    getProposalData({ ...params }),
    getCrossChainProposalData({ ...params }),
    getExtendedProposalData({ ...params }),
  ]);

  const proposals = [..._proposals, ..._xcProposals];

  appendProposalExtendedData(proposals, _extendedDatas);

  return _.first(proposals);
}
