import { type Environment } from "../../../environments/index.js";
import type { GetSnapshotProposalsReturnType } from "./getSnapshotProposals.js";
export declare const getSnapshotProposalData: (params: {
    environments: Environment[];
    pagination?: {
        size?: number;
        page?: number;
    };
    filters?: {
        onlyActive?: boolean;
        id?: string;
    };
}) => Promise<GetSnapshotProposalsReturnType>;
//# sourceMappingURL=common.d.ts.map