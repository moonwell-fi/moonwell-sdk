import type { Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Environment } from "../../../environments/index.js";
import type { Market } from "../../../types/market.js";
import { getMarketsData } from "./common.js";

export type GetMarketsParameters<
  environments,
  network extends Chain | undefined,
> = undefined extends network
  ? {
      /** Chain ID */
      chainId?: number;
    }
  : {
      /** Network key */
      network?: keyof environments;
    };

export type GetMarketsReturnType = Promise<Market[]>;

export async function getMarkets<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMarketsParameters<environments, Network>,
): GetMarketsReturnType {
  const { chainId, network } = args as {
    chainId: number;
    network: keyof typeof client.environments;
  };

  const environment = chainId
    ? (Object.values(client.environments).find(
        (env) => env.chainId === chainId,
      ) as Environment)
    : (client.environments[network] as Environment);

  const environments = Object.values(client.environments).filter((e) =>
    environment === undefined ? true : e.chainId === environment.chainId,
  );

  const result = await Promise.all(
    environments.map((environment) => getMarketsData(environment)),
  );

  return result.flat();
}
