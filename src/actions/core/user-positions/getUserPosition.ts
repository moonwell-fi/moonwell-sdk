import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type {
  Chain,
  Environment,
  GetEnvironment,
  MarketsType,
} from "../../../environments/index.js";
import type { UserMarketPosition } from "../../../types/userPosition.js";
import { getUserPositionData } from "./common.js";

export type GetUserPositionParameters<
  environments,
  network extends Chain | undefined,
> = undefined extends network
  ? {
      /** Chain ID */
      chainId: number;

      /** Address of the market token */
      marketAddress: Address;

      /** User address*/
      userAddress: Address;
    }
  : {
      /** Network key */
      network: keyof environments;

      /** Market key */
      market: keyof MarketsType<GetEnvironment<network>>;

      /** User address*/
      userAddress: Address;
    };

export type GetUserPositiontReturnType = Promise<
  UserMarketPosition | undefined
>;

export async function getUserPosition<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionParameters<environments, Network>,
): GetUserPositiontReturnType {
  let { chainId, network, marketAddress, userAddress } = args as {
    chainId: number;
    network: keyof typeof client.environments;
    marketAddress: Address;
    userAddress: Address;
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

  const userPosition = await getUserPositionData({
    environment,
    account: userAddress,
    markets: [marketAddress],
  });

  return userPosition?.length > 0 ? userPosition[0] : undefined;
}
