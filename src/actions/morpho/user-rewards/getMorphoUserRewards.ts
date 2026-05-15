import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoUserReward } from "../../../types/morphoUserReward.js";
import { getUserMorphoRewardsData } from "./common.js";

export type GetMorphoUserRewardsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  userAddress: Address;
  /**
   * When true, errors from the external Merkl API are propagated to the
   * caller instead of being swallowed and returning `[]`. Default `false`
   * preserves the historical behavior for existing consumers; the frontend
   * sets it `true` so React Query can surface a degradation notice.
   */
  throwOnExternalApiError?: boolean;
};

export type GetMorphoUserRewardsReturnType = Promise<MorphoUserReward[]>;

export async function getMorphoUserRewards<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoUserRewardsParameters<environments, Network>,
): GetMorphoUserRewardsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const environmentsUserRewards = await Promise.all(
    environments
      .filter((environment) => environment.contracts.morphoViews !== undefined)
      .map((environment) => {
        return getUserMorphoRewardsData({
          environment,
          account: args.userAddress,
          ...(args.throwOnExternalApiError !== undefined && {
            throwOnExternalApiError: args.throwOnExternalApiError,
          }),
        });
      }),
  );

  return environmentsUserRewards.flat();
}
