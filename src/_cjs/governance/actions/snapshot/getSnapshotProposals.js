"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotProposals = void 0;
const common_js_1 = require("./common.js");
const getSnapshotProposals = async (params) => {
    try {
        return (0, common_js_1.getSnapshotProposalData)(params);
    }
    catch (ex) {
        console.error("An error occured while fetching snapshot proposals...", ex);
        return {
            proposals: [],
            total: 0,
            active: 0,
        };
    }
};
exports.getSnapshotProposals = getSnapshotProposals;
//# sourceMappingURL=getSnapshotProposals.js.map