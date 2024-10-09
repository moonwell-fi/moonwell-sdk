import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoMarket } from "../../../types/morphoMarket.js";
import { getMorphoMarketsData } from "./common.js";

export type GetMorphoMarketsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  includeRewards?: boolean | undefined;
};

export type GetMorphoMarketsReturnType = Promise<MorphoMarket[]>;

export async function getMorphoMarkets<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetMorphoMarketsParameters<environments, Network>,
): GetMorphoMarketsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  return getMorphoMarketsData({
    environments: environments,
    includeRewards: args?.includeRewards,
  });
}
