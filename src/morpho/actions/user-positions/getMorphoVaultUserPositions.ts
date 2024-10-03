import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type { MorphoVaultUserPosition } from "../../types/userPosition.js";
import { getMorphoVaultUserPositionsData } from "./common.js";

export async function getMorphoVaultUserPositions(params: {
  environments: Environment[];
  account: `0x${string}`;
  vaults?: string[];
}): Promise<MultichainReturnType<MorphoVaultUserPosition[]>> {
  const environmentsUserPositions = await Promise.all(
    params.environments.map((environment) => {
      return getMorphoVaultUserPositionsData({
        environment,
        account: params.account,
        vaults: params.vaults,
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
    {} as MultichainReturnType<MorphoVaultUserPosition[]>,
  );

  return userPositions;
}
