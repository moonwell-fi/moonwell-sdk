import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import { readAcrossEnvironments } from "../../../common/readAcrossEnvironments.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { UserPosition } from "../../../types/userPosition.js";
import { getUserPositionData } from "./common.js";

export type GetUserPositionsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserPositionsReturnType = Promise<UserPosition[]>;

/**
 * Rejects with a `ChainReadError` when the read fails on any requested chain,
 * so a failed RPC never looks like an empty position list. The error lists the
 * failed chains and carries the positions from the chains that succeeded.
 */
export async function getUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionsParameters<environments, Network>,
): GetUserPositionsReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  return readAcrossEnvironments({
    environments,
    source: "getUserPositions",
    read: (environment) =>
      getUserPositionData({
        environment,
        account: userAddress,
      }),
  });
}
