import { getSnapshotProposalData } from "./common.js";
export const getSnapshotProposals = async (params) => {
    try {
        return getSnapshotProposalData(params);
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
//# sourceMappingURL=getSnapshotProposals.js.map