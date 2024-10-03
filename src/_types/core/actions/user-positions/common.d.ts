import type { Address } from "viem";
import type { Environment } from "../../../environments/index.js";
import type { UserMarketPosition } from "../../types/userPosition.js";
export declare const getUserPositionData: (params: {
    environment: Environment;
    account: Address;
    markets?: string[] | undefined;
}) => Promise<UserMarketPosition[]>;
//# sourceMappingURL=common.d.ts.map