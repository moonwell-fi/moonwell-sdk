import lodash from "lodash";
const { first } = lodash;
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoVaultUserPosition } from "../../../types/morphoUserPosition.js";
import { getMorphoVaultUserPositionsData } from "./common.js";

export type GetMorphoVaultUserPositionParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    userAddress: Address;
  };

export type GetMorphoVaultUserPositionReturnType = Promise<
  MorphoVaultUserPosition | undefined
>;

export async function getMorphoVaultUserPosition<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionParameters<environments, Network>,
): GetMorphoVaultUserPositionReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

  let { vaultAddress, vault } = args as unknown as {
    vaultAddress: Address;
    vault: string;
  };

  if (!vaultAddress) {
    vaultAddress = environment.vaults[vault].address;
  }

  const userPositions = await getMorphoVaultUserPositionsData({
    environment: environment,
    account: args.userAddress,
    vaults: [vaultAddress],
  });

  return first(userPositions);
}
