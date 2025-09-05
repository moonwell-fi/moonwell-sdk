import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
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

export async function getUserPositions<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionsParameters<environments, Network>,
): GetUserPositionsReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  const settled = await Promise.allSettled(
    environments.map((environment) =>
      getUserPositionData({
        environment,
        account: userAddress,
      }),
    ),
  );

  const result = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  return result;
}
