import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { UserMarketReward } from "../../../types/userReward.js";
import { getUserRewardsData } from "./common.js";

export async function getUserRewards(params: {
  environments: Environment[];
  account: `0x${string}`;
  markets?: string[] | undefined;
}): Promise<MultichainReturnType<UserMarketReward[]>> {
  const envs = params.environments;

  const environmentsUserRewards = await Promise.all(
    envs.map((environment) => {
      return getUserRewardsData({
        environment,
        account: params.account,
        markets: params.markets,
      });
    }),
  );

  const userRewards = envs.reduce(
    (prev, curr, index) => {
      const rewards = environmentsUserRewards[index]!;
      return {
        ...prev,
        [curr.chainId]: rewards,
      };
    },
    {} as MultichainReturnType<UserMarketReward[]>,
  );

  return userRewards;
}
