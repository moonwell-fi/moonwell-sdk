import type { Chain } from "viem";
import {
  type GetMarketParameters,
  getMarket,
} from "../actions/core/markets/getMarket.js";
import {
  type GetMarketsParameters,
  getMarkets,
} from "../actions/core/markets/getMarkets.js";
import type { MoonwellClient } from "./createMoonwellClient.js";

export const createActions = <environments>(
  client: MoonwellClient<environments>,
) => {
  return {
    getMarket: <chain extends Chain | undefined>(
      args: GetMarketParameters<environments, chain>,
    ) => getMarket<environments, chain>(client, args),
    getMarkets: <chain extends Chain | undefined>(
      args: GetMarketsParameters<environments, chain>,
    ) => getMarkets<environments, chain>(client, args),
  };
};
