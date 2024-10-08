import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type {
  Environment,
  GetEnvironment,
  MarketsType,
} from "../../../environments/index.js";
import type { Market } from "../../../types/market.js";
import { getMarketsData } from "./common.js";

export type GetMarketParameters<
  environments,
  Network extends Chain | undefined,
> = undefined extends Network
  ? {
      /** Chain ID */
      chainId: number;

      /** Address of the market token */
      marketAddress: Address;
    }
  : {
      /** Network key */
      network: keyof environments;
      /** Market key */
      market: keyof MarketsType<GetEnvironment<Network>>;
    };

export type GetMarketReturnType = Promise<Market | undefined>;

export async function getMarket<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: undefined extends Network
    ? GetMarketParameters<environments, undefined>
    : GetMarketParameters<environments, Network>,
): GetMarketReturnType {
  let { chainId, network, marketAddress } = args as {
    chainId: number;
    network: keyof typeof client.environments;
    marketAddress: Address;
  };
  const environment = chainId
    ? (Object.values(client.environments).find(
        (env) => env.chainId === chainId,
      ) as Environment)
    : (client.environments[network] as Environment);

  if (!marketAddress) {
    const { market } = args as unknown as { market: string };
    marketAddress = environment.markets[market].address;
  }

  const markets = await getMarketsData(environment);
  return markets.find((m) => m.marketToken.address === marketAddress);
}
