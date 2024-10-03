import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type { MorphoMarketUserPosition } from "../../types/userPosition.js";
import { getMorphoMarketUserPositionsData } from "./common.js";

export async function getMorphoMarketUserPositions(params: {
  environments: Environment[];
  account: `0x${string}`;
  markets?: string[];
}): Promise<MultichainReturnType<MorphoMarketUserPosition[]>> {
  const environmentsUserPositions = await Promise.all(
    params.environments.map((environment) => {
      return getMorphoMarketUserPositionsData({
        environment,
        account: params.account,
        markets: params.markets,
      });
    }),
  );

  const userPositions = params.environments.reduce(
    (prev, curr, index) => {
      const positions = environmentsUserPositions[index]!;
      return {
        ...prev,
        [curr.chainId]: positions,
      };
    },
    {} as MultichainReturnType<MorphoMarketUserPosition[]>,
  );

  return userPositions;
}
