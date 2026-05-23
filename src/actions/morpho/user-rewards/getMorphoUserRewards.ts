import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoUserReward } from "../../../types/morphoUserReward.js";
import { MerklApiError, getUserMorphoRewardsData } from "./common.js";

/**
 * AggregateError thrown by `getMorphoUserRewards` when one or more chains
 * fail and `throwOnExternalApiError` is `true`. The `rewards` property
 * carries the rewards from any chains that succeeded so callers can still
 * surface partial results alongside the per-chain failures in `errors`.
 */
export class MorphoUserRewardsAggregateError extends AggregateError {
  readonly rewards: MorphoUserReward[];

  constructor(errors: Error[], message: string, rewards: MorphoUserReward[]) {
    super(errors, message);
    this.name = "MorphoUserRewardsAggregateError";
    this.rewards = rewards;
  }
}

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
   * succeed, this throws a `MorphoUserRewardsAggregateError` whose `errors`
   * array contains the per-chain failures and whose `rewards` property
   * carries the successful chains' rewards so the caller can still display
   * partial results.
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
  for (const [i, result] of settled.entries()) {
    const environment = targetEnvironments[i];
    if (result.status === "fulfilled") {
      fulfilled.push(...result.value);
      continue;
    }
    const reason = result.reason;
    if (reason instanceof MerklApiError) {
      failures.push(reason);
      failedChainIds.push(reason.chainId);
      continue;
    }
    const baseError =
      reason instanceof Error ? reason : new Error(String(reason));
    failures.push(
      new Error(
        `getMorphoUserRewards failed for chain ${environment.chainId}: ${baseError.message}`,
        { cause: baseError },
      ),
    );
    failedChainIds.push(environment.chainId);
  }

  if (failures.length > 0 && args.throwOnExternalApiError === true) {
    throw new MorphoUserRewardsAggregateError(
      failures,
      `getMorphoUserRewards failed for chains: ${failedChainIds.join(", ")}`,
      fulfilled,
    );
  }

  return fulfilled;
}
