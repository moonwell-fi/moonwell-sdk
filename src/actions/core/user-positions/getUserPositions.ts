import type { MultichainReturnType } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import type { UserMarketPosition } from "../../../types/userPosition.js";
import { getUserPositionData } from "./common.js";

export async function getUserPositions(params: {
  environments: Environment[];
  account: `0x${string}`;
  markets?: string[] | undefined;
}): Promise<MultichainReturnType<UserMarketPosition[]>> {
  const envs = params.environments;

  const environmentsUserPositions = await Promise.all(
    envs.map((environment) => {
      return getUserPositionData({
        environment,
        account: params.account,
        markets: params.markets,
      });
    }),
  );

  const userPositions = envs.reduce(
    (prev, curr, index) => {
      const position = environmentsUserPositions[index]!;
      return {
        ...prev,
        [curr.chainId]: position,
      };
    },
    {} as MultichainReturnType<UserMarketPosition[]>,
  );

  return userPositions;
}
