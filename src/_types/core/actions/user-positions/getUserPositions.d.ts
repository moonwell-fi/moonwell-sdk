import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { UserMarketPosition } from "../../types/userPosition.js";
export declare function getUserPositions(params: {
    environments: Environment[];
    account: `0x${string}`;
    markets?: string[] | undefined;
}): Promise<MultichainReturnType<UserMarketPosition[]>>;
//# sourceMappingURL=getUserPositions.d.ts.map