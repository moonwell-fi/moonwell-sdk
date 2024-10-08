import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MarketParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type {
  GetEnvironment,
  MarketsType,
} from "../../../environments/index.js";
import type { Market } from "../../../types/market.js";
import { getMarketsData } from "./common.js";

export type GetMarketParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & MarketParameterType<network>;

export type GetMarketReturnType = Promise<Market | undefined>;

export async function getMarket<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMarketParameters<environments, Network>,
): GetMarketReturnType {
  let { marketAddress, market } = args as unknown as {
    marketAddress: Address;
    market: keyof MarketsType<GetEnvironment<Network>>;
  };

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

  if (!marketAddress) {
    marketAddress = environment.markets[market].address;
  }

  const markets = await getMarketsData(environment);
  return markets.find((m) => m.marketToken.address === marketAddress);
}
