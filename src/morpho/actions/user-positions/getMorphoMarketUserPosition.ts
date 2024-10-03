import type { Environment } from "../../../environments/index.js";
import type { MorphoMarketUserPosition } from "../../types/userPosition.js";
import { getMorphoMarketUserPositionsData } from "./common.js";

export async function getMorphoVaultUserPosition(params: {
  environment: Environment;
  account: `0x${string}`;
  market: string;
}): Promise<MorphoMarketUserPosition | undefined> {
  const userPosition = await getMorphoMarketUserPositionsData({
    environment: params.environment,
    account: params.account,
    markets: [params.market],
  });
  return userPosition?.length > 0 ? userPosition[0] : undefined;
}
