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
   * preserves the historical behavior for existing consumers.
   *
   * If multiple environments are queried and at least one fails while others
   * succeed, this throws an `AggregateError` whose `errors` array contains
   * the per-chain failures. Successful chains' rewards are not returned in
   * the error path; callers wanting partial success should set this to
   * `false` (the default) and inspect logs for per-chain failures.
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
  const targetEnvironments = getEnvironmentsFromArgs(client, args).filter(
    (environment) => environment.contracts.morphoViews !== undefined,
  );

  const settled = await Promise.allSettled(
    targetEnvironments.map((environment) =>
      getUserMorphoRewardsData({
        environment,
        account: args.userAddress,
        ...(args.throwOnExternalApiError !== undefined && {
          throwOnExternalApiError: args.throwOnExternalApiError,
        }),
      }),
    ),
  );

  const fulfilled: MorphoUserReward[] = [];
  const failures: Error[] = [];
  const failedChainIds: number[] = [];
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    const environment = targetEnvironments[i];
    if (result === undefined || environment === undefined) continue;
    if (result.status === "fulfilled") {
      fulfilled.push(...result.value);
    } else {
      const baseError =
        result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason));
      failures.push(
        new Error(
          `getMorphoUserRewards failed for chain ${environment.chainId}: ${baseError.message}`,
          { cause: baseError },
        ),
      );
      failedChainIds.push(environment.chainId);
    }
  }

  if (failures.length > 0 && args.throwOnExternalApiError === true) {
    throw new AggregateError(
      failures,
      `getMorphoUserRewards failed for chains: ${failedChainIds.join(", ")}`,
    );
  }

  return fulfilled;
}
