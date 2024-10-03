import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { Market } from "../../types/market.js";
export declare function getMarkets(params: {
    environments: Environment[];
}): Promise<MultichainReturnType<Market[]>>;
//# sourceMappingURL=getMarkets.d.ts.map