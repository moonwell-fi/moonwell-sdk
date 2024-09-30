import { first } from "lodash";
import { appendProposalExtendedData, getCrossChainProposalData, getExtendedProposalData, getProposalData, } from "./common.js";
export async function getProposal(params) {
    const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
        getProposalData({ ...params }),
        getCrossChainProposalData({ ...params }),
        getExtendedProposalData({ ...params }),
    ]);
    const proposals = [..._proposals, ..._xcProposals];
    appendProposalExtendedData(proposals, _extendedDatas);
    return first(proposals);
}
//# sourceMappingURL=getProposal.js.map