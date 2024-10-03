import type { Environment } from "../../../environments/index.js";
import type { MorphoMarket } from "../../../morpho/types/market.js";
import { getMorphoMarketsData } from "./common.js";

export async function getMorphoMarket(params: {
  environment: Environment;
  market: string;
  includeRewards?: boolean | undefined;
}): Promise<MorphoMarket> {
  const markets = await getMorphoMarketsData({
    environments: [params.environment],
    markets: [params.market],
    includeRewards: params.includeRewards,
  });

  return markets[params.environment.chainId]?.[0] || undefined;
}
