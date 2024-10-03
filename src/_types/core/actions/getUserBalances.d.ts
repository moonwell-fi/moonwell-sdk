import { type MultichainReturnType } from "../../common/index.js";
import type { Environment } from "../../environments/index.js";
import type { UserBalance } from "../types/userBalance.js";
export declare function getUserBalances(params: {
    environments: Environment[];
    account: `0x${string}`;
}): Promise<MultichainReturnType<UserBalance[]>>;
//# sourceMappingURL=getUserBalances.d.ts.map