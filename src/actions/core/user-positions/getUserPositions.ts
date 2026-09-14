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
 * Rejects when the read fails on any requested chain (after reporting each
 * failure via the client's `onError`), so a failed RPC never looks like an
 * empty position list.
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
