import { type Environment } from "../../../environments/index.js";
import { type ExtendedProposalData, type Proposal } from "../../types/proposal.js";
export declare const appendProposalExtendedData: (proposals: Proposal[], extendedDatas: ExtendedProposalData[]) => void;
export declare const getProposalData: (params: {
    environment: Environment;
    id?: number;
}) => Promise<Proposal[]>;
export declare const getCrossChainProposalData: (params: {
    environment: Environment;
    id?: number;
}) => Promise<Proposal[]>;
export declare const getExtendedProposalData: (params: {
    environment: Environment;
    id?: number;
}) => Promise<ExtendedProposalData[]>;
//# sourceMappingURL=common.d.ts.map