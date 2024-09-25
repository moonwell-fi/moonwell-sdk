import type { CoreMarket } from "@/types/market.js";
import type { MultichainReturnType } from "@moonwell-sdk/common";
import { type Environment, environments } from "@moonwell-sdk/environments";
import { getMarketsData } from "./common.js";

export type GetMarketsReturnType = MultichainReturnType<CoreMarket>;

export async function getMarkets(params?: {
  environments?: Environment[];
}): Promise<GetMarketsReturnType | undefined> {
  const envs = (params?.environments || environments) as Environment[];

  const environmentsMarkets = await Promise.all(envs.map((environment) => getMarketsData(environment)));

  return environmentsMarkets.reduce((prev, curr) => {
    return {
      ...prev,
      [curr.chainId]: curr,
    };
  }, {} as GetMarketsReturnType);
}
