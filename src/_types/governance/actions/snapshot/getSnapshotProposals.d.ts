import type { Environment } from "../../../environments/index.js";
import type { SnapshotProposal } from "../../types/snapshotProposal.js";
export type GetSnapshotProposalsReturnType = {
    proposals: SnapshotProposal[];
    total: number;
    active: number;
};
export declare const getSnapshotProposals: (params: {
    environments: Environment[];
    pagination?: {
        size?: number;
        page?: number;
    };
    filters?: {
        onlyActive?: boolean;
    };
}) => Promise<GetSnapshotProposalsReturnType>;
//# sourceMappingURL=getSnapshotProposals.d.ts.map