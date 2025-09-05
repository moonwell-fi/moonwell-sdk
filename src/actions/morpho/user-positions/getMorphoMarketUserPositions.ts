import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoMarketUserPosition } from "../../../types/morphoUserPosition.js";
import { getMorphoMarketUserPositionsData } from "./common.js";

export type GetMorphoMarketUserPositionsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  userAddress: Address;
};

export type GetMorphoMarketUserPositionsReturnType = Promise<
  MorphoMarketUserPosition[]
>;

export async function getMorphoMarketUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoMarketUserPositionsParameters<environments, Network>,
): GetMorphoMarketUserPositionsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const settled = await Promise.allSettled(
    environments
      .filter((environment) => environment.contracts.morphoViews !== undefined)
      .map((environment) => {
        return getMorphoMarketUserPositionsData({
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
