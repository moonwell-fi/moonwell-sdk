import { first } from "lodash";
import { getSnapshotProposalData } from "./common.js";
export const getSnapshotProposal = async (params) => {
    const result = await getSnapshotProposalData({
        environments: [params.environment],
        filters: {
            id: params.id,
        },
    });
    return first(result.proposals);
};
//# sourceMappingURL=getSnapshotProposal.js.map