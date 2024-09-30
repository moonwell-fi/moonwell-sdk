"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposals = void 0;
const common_js_1 = require("./common.js");
async function getProposals(params) {
    const envs = params.environments;
    try {
        const environmentProposals = await Promise.all(envs.map((environment) => Promise.all([
            (0, common_js_1.getProposalData)({ environment }),
            (0, common_js_1.getCrossChainProposalData)({ environment }),
            (0, common_js_1.getExtendedProposalData)({ environment }),
        ])));
        const proposals = envs.reduce((prev, curr, index) => {
            const [_proposals, _xcProposals, _extendedDatas] = environmentProposals[index];
            const proposals = [..._proposals, ..._xcProposals];
            (0, common_js_1.appendProposalExtendedData)(proposals, _extendedDatas);
            return {
                ...prev,
                [curr.chainId]: proposals,
            };
        }, {});
        return proposals;
    }
    catch (ex) {
        console.error("An error occured while fetching proposals...", ex);
        return {};
    }
}
exports.getProposals = getProposals;
//# sourceMappingURL=getProposals.js.map