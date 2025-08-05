import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import type { MorphoVault } from "../../../types/morphoVault.js";
import { getMorphoVaultsData } from "./common.js";

export type GetMorphoVaultsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  includeRewards?: boolean | undefined;
  currentChainRewardsOnly?: boolean | undefined;
};

export type GetMorphoVaultsReturnType = Promise<MorphoVault[]>;

export async function getMorphoVaults<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetMorphoVaultsParameters<environments, Network>,
): GetMorphoVaultsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const logId = logger.start("getMorphoVaults", "Starting to get vaults...");

  const result = await getMorphoVaultsData({
    environments: environments,
    includeRewards: args?.includeRewards ?? false,
    currentChainRewardsOnly: args?.currentChainRewardsOnly ?? false,
  });

  logger.end(logId);

  return result;
}
