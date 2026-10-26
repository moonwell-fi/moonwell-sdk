import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import { readAcrossEnvironments } from "../../../common/readAcrossEnvironments.js";
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

/**
 * Rejects with a `ChainReadError` when the read fails on any requested chain,
 * so a failed RPC never looks like an empty position list. The error lists the
 * failed chains and carries the positions from the chains that succeeded.
 */
export async function getMorphoVaultUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionsParameters<environments, Network>,
): GetMorphoVaultUserPositionsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  return readAcrossEnvironments({
    environments,
    source: "getMorphoVaultUserPositions",
    read: (environment) =>
      getMorphoVaultUserPositionsData({
        environment,
        account: args.userAddress,
      }),
  });
}
