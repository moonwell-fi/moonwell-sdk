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
import type { MorphoMarketUserPosition } from "../../../types/morphoUserPosition.js";
import { getMorphoMarketUserPositionsData } from "./common.js";

export type GetMorphoMarketUserPositionParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoMarketParameterType<network> & {
    userAddress: Address;
  };

export type GetMorphoMarketUserPositionReturnType = Promise<
  MorphoMarketUserPosition | undefined
>;

export async function getMorphoMarketUserPosition<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoMarketUserPositionParameters<environments, Network>,
): GetMorphoMarketUserPositionReturnType {
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

  const userPositions = await getMorphoMarketUserPositionsData({
    environment,
    account: args.userAddress,
    markets: [marketId],
  });

  return first(userPositions);
}
