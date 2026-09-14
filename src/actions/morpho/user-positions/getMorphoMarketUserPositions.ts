import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import { readAcrossEnvironments } from "../../../common/readAcrossEnvironments.js";
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

/**
 * Rejects when the read fails on any requested chain (after reporting each
 * failure via the client's `onError`), so a failed RPC never looks like an
 * empty position list.
 */
export async function getMorphoMarketUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoMarketUserPositionsParameters<environments, Network>,
): GetMorphoMarketUserPositionsReturnType {
  const environments = getEnvironmentsFromArgs(client, args).filter(
    (environment) => environment.contracts.morphoViews !== undefined,
  );

  return readAcrossEnvironments({
    environments,
    source: "getMorphoMarketUserPositions",
    read: (environment) =>
      getMorphoMarketUserPositionsData({
        environment,
        account: args.userAddress,
      }),
  });
}
