import type { Environment } from "../../../environments/index.js";
import type { MorphoVaultUserPosition } from "../../types/userPosition.js";
import { getMorphoVaultUserPositionsData } from "./common.js";

export async function getMorphoVaultUserPosition(params: {
  environment: Environment;
  account: `0x${string}`;
  vault: string;
}): Promise<MorphoVaultUserPosition | undefined> {
  const userPosition = await getMorphoVaultUserPositionsData({
    environment: params.environment,
    account: params.account,
    vaults: [params.vault],
  });
  return userPosition?.length > 0 ? userPosition[0] : undefined;
}
