import type { Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import * as logger from "../../../logger/console.js";
import type { Market } from "../../../types/market.js";
import { getMarketsData } from "./common.js";

export type GetMarketsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network>;

export type GetMarketsReturnType = Promise<Market[]>;

export async function getMarkets<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetMarketsParameters<environments, Network>,
): GetMarketsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const logId = logger.start("getMarkets", "Starting to get markets...");

  const result = await Promise.all(
    environments.map((environment) => getMarketsData(environment)),
  );

  logger.end(logId);

  return result.flat();
}
