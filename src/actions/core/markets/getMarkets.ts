import type { Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import * as logger from "../../../logger/console.js";
import type { Market } from "../../../types/market.js";
import { fetchLiquidStakingRewards, getMarketsData } from "./common.js";

export type GetMarketsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  includeLiquidStakingRewards?: boolean;
};

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

  const settlements = await Promise.allSettled(
    environments.map((environment) => getMarketsData(environment)),
  );

  const result = settlements
    .filter(
      (s): s is PromiseFulfilledResult<Market[]> => s.status === "fulfilled",
    )
    .map((s) => s.value);

  if (args?.includeLiquidStakingRewards === true) {
    const liquidStakingRewards = await fetchLiquidStakingRewards();
    for (const item of result.flat()) {
      if (item.underlyingToken.symbol.toLowerCase() === "cbeth") {
        item.rewards.push({
          token: item.underlyingToken,
          supplyApr: 0,
          borrowApr: 0,
          liquidStakingApr: liquidStakingRewards.cbETH,
        });
      }

      if (item.underlyingToken.symbol.toLowerCase() === "reth") {
        item.rewards.push({
          token: item.underlyingToken,
          supplyApr: 0,
          borrowApr: 0,
          liquidStakingApr: liquidStakingRewards.rETH,
        });
      }

      if (item.underlyingToken.symbol.toLowerCase() === "wsteth") {
        item.rewards.push({
          token: item.underlyingToken,
          supplyApr: 0,
          borrowApr: 0,
          liquidStakingApr: liquidStakingRewards.wstETH,
        });
      }

      item.totalSupplyApr =
        item.baseSupplyApy +
        item.rewards.reduce(
          (acc, reward) => acc + reward.supplyApr + reward.liquidStakingApr,
          0,
        );
    }
  }

  logger.end(logId);

  return result.flat();
}
