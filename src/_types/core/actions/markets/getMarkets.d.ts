import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { CoreMarket } from "../../types/market.js";
export type GetMarketsReturnType = MultichainReturnType<CoreMarket>;
export declare function getMarkets(params: {
    environments: Environment[];
}): Promise<GetMarketsReturnType | undefined>;
//# sourceMappingURL=getMarkets.d.ts.map