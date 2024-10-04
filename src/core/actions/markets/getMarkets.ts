import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { Market } from "../../types/market.js";
import { getMarketsData } from "./common.js";

export async function getMarkets(params: {
  environments: Environment[];
}): Promise<MultichainReturnType<Market[]>> {
  const { environments } = params;
  const environmentIds = environments.map((r) => r.chainId);
  type environmentKeys = keyof typeof environmentIds;

  const environmentsMarkets = await Promise.all(
    environments.map((environment) => getMarketsData(environment)),
  );

  return environments.reduce(
    (prev, curr, currIndex) => {
      return {
        ...prev,
        [curr.chainId]: environmentsMarkets[currIndex],
      };
    },
    {} as { [name in environmentKeys]: Market[] },
  );
}
