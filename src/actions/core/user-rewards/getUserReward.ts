import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MarketParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { UserReward } from "../../../types/userReward.js";
import { getUserRewardsData } from "./common.js";

export type GetUserRewardParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MarketParameterType<network> & {
    /** User address*/
    userAddress: Address;
  };
export type GetUserRewardReturnType = Promise<UserReward | undefined>;

export async function getUserReward<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserRewardParameters<environments, Network>,
): GetUserRewardReturnType {
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

  const userRewards = await getUserRewardsData({
    environment: environment,
    account: userAddress,
    markets: [marketAddress],
  });

  return userRewards?.length > 0 ? userRewards[0] : undefined;
}
