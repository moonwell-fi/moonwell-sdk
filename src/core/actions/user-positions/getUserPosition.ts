import type { Environment } from "../../../environments/index.js";
import type { UserPosition } from "../../types/userPosition.js";
import { getUserPositionData } from "./common.js";

export type GetUserPositionReturnType = UserPosition;

export async function getUserPosition(params: {
  environment: Environment;
  account: `0x${string}`;
}): Promise<GetUserPositionReturnType | undefined> {
  try {
    return getUserPositionData(params.environment, params.account);
  } catch (ex) {
    console.error("[getUserPosition] An error occured...", ex);
    return;
  }
}
