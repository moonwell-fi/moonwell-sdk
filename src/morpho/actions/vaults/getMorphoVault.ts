import type { Environment } from "../../../environments/index.js";
import type { MorphoVault } from "../../../morpho/types/vault.js";
import { getMorphoVaultsData } from "./common.js";

export async function getMorphoVault(params: {
  environment: Environment;
  vault: string;
  includeRewards?: boolean;
}): Promise<MorphoVault | undefined> {
  const result = await getMorphoVaultsData({
    environments: [params.environment],
    vaults: [params.vault],
    includeRewards: params.includeRewards ?? false,
  });

  return result[params.environment.chainId]?.[0];
}
