import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { UserReward } from "../../../types/userReward.js";
import { getUserRewardsData } from "./common.js";

export type GetUserRewardsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserRewardsReturnType = Promise<UserReward[]>;

export async function getUserRewards<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserRewardsParameters<environments, Network>,
): GetUserRewardsReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  const settled = await Promise.allSettled(
    environments.map((environment) =>
      getUserRewardsData({
        environment,
        account: userAddress,
      }),
    ),
  );

  const result = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  return result;
}
