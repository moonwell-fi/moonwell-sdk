import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { Proposal } from "../../types/proposal.js";
export type GetProposalsReturnType = MultichainReturnType<Proposal[]>;
export declare function getProposals(params: {
    environments: Environment[];
}): Promise<GetProposalsReturnType>;
//# sourceMappingURL=getProposals.d.ts.map