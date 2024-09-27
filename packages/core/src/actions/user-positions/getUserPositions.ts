import type { UserPosition } from "@/types/userPosition.js";
import type { MultichainReturnType } from "@moonwell-sdk/common";
import type { Environment } from "@moonwell-sdk/environments";
import { getUserPositionData } from "./common.js";

export type GetUserPositionsReturnType = MultichainReturnType<UserPosition>;

export async function getUserPositions(params: {
  environments: Environment[];
  account: `0x${string}`;
}): Promise<GetUserPositionsReturnType | undefined> {
  const envs = params.environments;

  try {
    const environmentsUserPositions = await Promise.all(
      envs.map((environment) => {
        return getUserPositionData(environment, params.account);
      }),
    );

    const userPositions = envs.reduce((prev, curr, index) => {
      const position = environmentsUserPositions[index]!;
      return {
        ...prev,
        [curr.network.chain.id]: position,
      };
    }, {} as GetUserPositionsReturnType);

    return userPositions;
  } catch (ex) {
    console.error("[getUserPositions] An error occured...", ex);
    return {};
  }
}
