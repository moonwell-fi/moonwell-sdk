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
import type { MorphoVault } from "../../../types/morphoVault.js";
import { getMorphoVaultsData } from "./common.js";

export type GetMorphoVaultParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    includeRewards?: boolean | undefined;
    currentChainRewardsOnly?: boolean | undefined;
  };

export type GetMorphoVaultReturnType = Promise<MorphoVault | undefined>;

export async function getMorphoVault<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultParameters<environments, Network>,
): GetMorphoVaultReturnType {
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

  const results = await getMorphoVaultsData({
    environments: [environment],
    vaults: [vaultAddress],
    includeRewards: args.includeRewards ?? false,
    currentChainRewardsOnly: args.currentChainRewardsOnly ?? false,
  });

  return first(results);
}
