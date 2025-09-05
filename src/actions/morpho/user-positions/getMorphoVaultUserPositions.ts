import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { MorphoVaultUserPosition } from "../../../types/morphoUserPosition.js";
import { getMorphoVaultUserPositionsData } from "./common.js";

export type GetMorphoVaultUserPositionsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  userAddress: Address;
};

export type GetMorphoVaultUserPositionsReturnType = Promise<
  MorphoVaultUserPosition[]
>;

export async function getMorphoVaultUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionsParameters<environments, Network>,
): GetMorphoVaultUserPositionsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const settled = await Promise.allSettled(
    environments
      .filter((environment) => environment.contracts.morphoViews !== undefined)
      .map((environment) => {
        return getMorphoVaultUserPositionsData({
          environment,
          account: args.userAddress,
        });
      }),
  );

  const result = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  return result;
}
