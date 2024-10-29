import lodash from "lodash";
const { first } = lodash;
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MorphoMarketParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoMarket } from "../../../types/morphoMarket.js";
import { getMorphoMarketsData } from "./common.js";

export type GetMorphoMarketParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoMarketParameterType<network> & {
    includeRewards?: boolean | undefined;
  };

export type GetMorphoMarketReturnType = Promise<MorphoMarket | undefined>;

export async function getMorphoMarket<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoMarketParameters<environments, Network>,
): GetMorphoMarketReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

  let { marketId, market } = args as unknown as {
    marketId: Address;
    market: string;
  };

  if (!marketId) {
    marketId = environment.config.morphoMarkets[market].id;
  }

  const markets = await getMorphoMarketsData({
    environments: [environment],
    markets: [marketId],
    includeRewards: args.includeRewards,
  });

  return first(markets);
}
