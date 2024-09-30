"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotProposal = void 0;
const lodash_1 = require("lodash");
const common_js_1 = require("./common.js");
const getSnapshotProposal = async (params) => {
    const result = await (0, common_js_1.getSnapshotProposalData)({
        environments: [params.environment],
        filters: {
            id: params.id,
        },
    });
    return (0, lodash_1.first)(result.proposals);
};
exports.getSnapshotProposal = getSnapshotProposal;
//# sourceMappingURL=getSnapshotProposal.js.map