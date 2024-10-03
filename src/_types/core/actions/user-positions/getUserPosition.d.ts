import type { UserMarketPosition } from "../../../core/types/userPosition.js";
import type { Environment } from "../../../environments/index.js";
export declare function getUserPosition(params: {
    environment: Environment;
    account: `0x${string}`;
    market: string;
}): Promise<UserMarketPosition | undefined>;
//# sourceMappingURL=getUserPosition.d.ts.map