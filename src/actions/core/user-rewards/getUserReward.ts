import type { Environment } from "../../../environments/index.js";
import type { UserMarketReward } from "../../../types/userReward.js";
import { getUserRewardsData } from "./common.js";

export async function getUserReward(params: {
  environment: Environment;
  account: `0x${string}`;
  market: string;
}): Promise<UserMarketReward | undefined> {
  const userRewards = await getUserRewardsData({
    environment: params.environment,
    account: params.account,
    markets: [params.market],
  });
  return userRewards?.length > 0 ? userRewards[0] : undefined;
}
