import { Amount } from "../../common/index.js";
import { type GovernanceToken } from "../../environments/index.js";
export type GetGovernanceTokenInfoType = {
    totalSupply: Amount;
};
export declare function getGovernanceTokenInfo(params: {
    governanceToken: GovernanceToken;
}): Promise<GetGovernanceTokenInfoType | undefined>;
//# sourceMappingURL=getGovernanceTokenInfo.d.ts.map