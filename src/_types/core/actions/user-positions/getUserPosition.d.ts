import type { Environment } from "../../../environments/index.js";
import type { UserPosition } from "../../types/userPosition.js";
export type GetUserPositionReturnType = UserPosition;
export declare function getUserPosition(params: {
    environment: Environment;
    account: `0x${string}`;
}): Promise<GetUserPositionReturnType | undefined>;
//# sourceMappingURL=getUserPosition.d.ts.map