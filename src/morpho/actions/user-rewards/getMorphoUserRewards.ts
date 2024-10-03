import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type { UserMorphoReward } from "../../types/userReward.js";
import { getUserMorphoRewardsData } from "./common.js";

export async function getMorphoUserRewards(params: {
  environments: Environment[];
  account: `0x${string}`;
}): Promise<MultichainReturnType<UserMorphoReward[]>> {
  const envs = params.environments;

  const environmentsUserRewards = await Promise.all(
    envs.map((environment) => {
      return getUserMorphoRewardsData({ environment, account: params.account });
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
    {} as MultichainReturnType<UserMorphoReward[]>,
  );

  return userRewards;
}
