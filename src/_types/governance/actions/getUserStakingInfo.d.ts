import { type MultichainReturnType } from "../../common/index.js";
import { type Environment } from "../../environments/index.js";
import type { UserStakingInfo } from "../types/staking.js";
export type GetUserStakingInfoReturnType = MultichainReturnType<UserStakingInfo>;
export declare function getUserStakingInfo(params: {
    environments: Environment[];
    account: `0x${string}`;
}): Promise<GetUserStakingInfoReturnType | undefined>;
//# sourceMappingURL=getUserStakingInfo.d.ts.map