import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type { MorphoVault } from "../../../morpho/types/vault.js";
import { getMorphoVaultsData } from "./common.js";

export async function getMorphoVaults(params: {
  environments: Environment[];
  vaults?: string[];
  includeRewards?: boolean;
}): Promise<MultichainReturnType<MorphoVault[]>> {
  return getMorphoVaultsData({
    environments: params.environments,
    includeRewards: params.includeRewards ?? false,
    vaults: params.vaults ?? [],
  });
}
