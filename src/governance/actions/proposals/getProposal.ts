import { first } from "lodash";
import type { Environment } from "../../../environments/index.js";
import type { Proposal } from "../../types/proposal.js";
import {
  appendProposalExtendedData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
} from "./common.js";

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

  return first(proposals);
}
