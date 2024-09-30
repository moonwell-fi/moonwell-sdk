import { type MultichainReturnType } from "../../common/index.js";
import { type Environment } from "../../environments/index.js";
import type { StakingInfo } from "../types/staking.js";
export type GetStakingInfoType = MultichainReturnType<StakingInfo>;
export declare function getStakingInfo(params: {
    environments: Environment[];
}): Promise<GetStakingInfoType>;
//# sourceMappingURL=getStakingInfo.d.ts.map