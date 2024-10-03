import type { UserMarketPosition } from "../../../core/types/userPosition.js";
import type { Environment } from "../../../environments/index.js";
import { getUserPositionData } from "./common.js";

export async function getUserPosition(params: {
  environment: Environment;
  account: `0x${string}`;
  market: string;
}): Promise<UserMarketPosition | undefined> {
  const userPosition = await getUserPositionData({
    environment: params.environment,
    account: params.account,
    markets: [params.market],
  });
  return userPosition?.length > 0 ? userPosition[0] : undefined;
}
