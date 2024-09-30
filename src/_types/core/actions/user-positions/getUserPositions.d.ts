import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { UserPosition } from "../../types/userPosition.js";
export type GetUserPositionsReturnType = MultichainReturnType<UserPosition>;
export declare function getUserPositions(params: {
    environments: Environment[];
    account: `0x${string}`;
}): Promise<GetUserPositionsReturnType | undefined>;
//# sourceMappingURL=getUserPositions.d.ts.map