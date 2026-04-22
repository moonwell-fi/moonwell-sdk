import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type {
  Chain,
  Environment,
  GetEnvironment,
  VaultsType,
} from "../../../environments/index.js";
import type { MorphoVaultUserPositionSnapshot } from "../../../types/morphoUserPosition.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
} from "../../lunar-indexer-client.js";

export type GetMorphoVaultUserPositionSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  (undefined extends network
    ? {
        /** Address of the vault token (omit to get all vaults for the account) */
        vaultAddress?: Address;
      }
    : {
        /** Vault key */
        vault: keyof VaultsType<GetEnvironment<network>>;
      }) & {
    userAddress: Address;
  };

export type GetMorphoVaultUserPositionSnapshotsReturnType = Promise<
  MorphoVaultUserPositionSnapshot[]
>;

export async function getMorphoVaultUserPositionSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionSnapshotsParameters<environments, Network>,
): GetMorphoVaultUserPositionSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const { vaultAddress: rawVaultAddress, vault } = args as unknown as {
    vaultAddress: Address | undefined;
    vault: string | undefined;
  };

  const vaultAddress: Address | undefined =
    rawVaultAddress ?? (vault ? environment.vaults[vault].address : undefined);

  const lunarIndexerUrl = environment.lunarIndexerUrl;

  if (!lunarIndexerUrl) {
    return [];
  }

  try {
    return await fetchUserPositionSnapshotsFromLunar(
      args.userAddress,
      vaultAddress,
      lunarIndexerUrl,
      environment,
    );
  } catch (error) {
    console.warn(
      `[getMorphoVaultUserPositionSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "morpho-vault-user-position-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }
}

async function fetchUserPositionSnapshotsFromLunar(
  userAddress: Address,
  vaultAddress: Address | undefined,
  lunarIndexerUrl: string,
  environment: Environment,
): Promise<MorphoVaultUserPositionSnapshot[]> {
  const lunarClient = createLunarIndexerClient({
    baseUrl: lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - 3 * 365 * 24 * 60 * 60;

  const portfolio = await lunarClient.getVaultAccountPortfolio(userAddress, {
    startTime,
    endTime,
    granularity: "1d",
    chainId: environment.chainId,
    ...(vaultAddress ? { vault: vaultAddress } : {}),
  });

  const snapshots: MorphoVaultUserPositionSnapshot[] = [];

  for (const position of portfolio.positions) {
    for (const v of position.vaults) {
      snapshots.push({
        chainId: v.chainId,
        account: userAddress,
        vaultAddress: v.vaultAddress as Address,
        suppliedUsd: v.shareBalanceUsd,
        timestamp: position.timestamp * 1000,
      });
    }
  }

  return snapshots;
}
