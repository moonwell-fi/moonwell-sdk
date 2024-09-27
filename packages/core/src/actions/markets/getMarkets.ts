import type { CoreMarket } from "@/types/market.js";
import type { MultichainReturnType } from "@moonwell-sdk/common";
import { type Environment, base as baseChain, createEnvironment, optimism as optimismChain } from "@moonwell-sdk/environments";
import { getMarketsData } from "./common.js";

export type GetMarketsReturnType = MultichainReturnType<CoreMarket>;

export async function getMarkets(params: {
  environments: Environment[];
}): Promise<GetMarketsReturnType | undefined> {
  const { environments } = params;

  const environmentsMarkets = await Promise.all(environments.map((environment) => getMarketsData(environment)));

  return environmentsMarkets.reduce((prev, curr) => {
    return {
      ...prev,
      [curr.chainId]: curr,
    };
  }, {} as GetMarketsReturnType);
}
