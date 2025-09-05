import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoUserStakingReward } from "../../../types/morphoUserStakingReward.js";
import { getUserMorphoStakingRewardsData } from "./common.js";

export type GetMorphoUserStakingRewardsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  userAddress: Address;
};

export type GetMorphoUserStakingRewardsReturnType = Promise<
  MorphoUserStakingReward[]
>;

export async function getMorphoUserStakingRewards<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoUserStakingRewardsParameters<environments, Network>,
): GetMorphoUserStakingRewardsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const settled = await Promise.allSettled(
    environments
      .filter((environment) => environment.contracts.morphoViews !== undefined)
      .map((environment) => {
        return getUserMorphoStakingRewardsData({
          environment,
          account: args.userAddress,
        });
      }),
  );

  const result = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  return result;
}
