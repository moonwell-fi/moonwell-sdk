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
 * Rejects when the read fails on any requested chain (after reporting each
 * failure via the client's `onError`), so a failed RPC never looks like an
 * empty position list.
 */
export async function getMorphoVaultUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionsParameters<environments, Network>,
): GetMorphoVaultUserPositionsReturnType {
  const environments = getEnvironmentsFromArgs(client, args).filter(
    (environment) => environment.contracts.morphoViews !== undefined,
  );

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
