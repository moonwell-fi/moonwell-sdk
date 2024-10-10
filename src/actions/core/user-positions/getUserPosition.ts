import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MarketParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { UserPosition } from "../../../types/userPosition.js";
import { getUserPositionData } from "./common.js";

export type GetUserPositionParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MarketParameterType<network> & {
    /** User address*/
    userAddress: Address;
  };

export type GetUserPositionReturnType = Promise<UserPosition | undefined>;

export async function getUserPosition<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionParameters<environments, Network>,
): GetUserPositionReturnType {
  let { marketAddress, userAddress } = args as {
    marketAddress: Address;
    userAddress: Address;
  };

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

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
