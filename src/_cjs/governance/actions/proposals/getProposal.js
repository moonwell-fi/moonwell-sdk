"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposal = void 0;
const lodash_1 = require("lodash");
const common_js_1 = require("./common.js");
async function getProposal(params) {
    const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
        (0, common_js_1.getProposalData)({ ...params }),
        (0, common_js_1.getCrossChainProposalData)({ ...params }),
        (0, common_js_1.getExtendedProposalData)({ ...params }),
    ]);
    const proposals = [..._proposals, ..._xcProposals];
    (0, common_js_1.appendProposalExtendedData)(proposals, _extendedDatas);
    return (0, lodash_1.first)(proposals);
}
exports.getProposal = getProposal;
//# sourceMappingURL=getProposal.js.map