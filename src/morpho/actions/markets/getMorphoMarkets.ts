import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type { MorphoMarket } from "../../../morpho/types/market.js";
import { getMorphoMarketsData } from "./common.js";

export async function getMorphoMarkets(params: {
  environments: Environment[];
  markets?: string[] | undefined;
  includeRewards?: boolean | undefined;
}): Promise<MultichainReturnType<MorphoMarket[]>> {
  return getMorphoMarketsData({
    environments: params.environments,
    markets: params.markets,
    includeRewards: params.includeRewards,
  });
}
