import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  toApiGranularity,
} from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { MorphoVaultSnapshot } from "../../../types/morphoVault.js";
import {
  fetchVaultSnapshotsFromIndexer,
  getV1VaultKey,
  transformVaultSnapshotsFromIndexer,
} from "./lunarIndexerTransform.js";

export type GetMorphoVaultSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    period?: "1M" | "3M" | "1Y" | "ALL";
    startTime?: number;
    endTime?: number;
  };

export type GetMorphoVaultSnapshotsReturnType = Promise<MorphoVaultSnapshot[]>;

export async function getMorphoVaultSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultSnapshotsParameters<environments, Network>,
): GetMorphoVaultSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const {
    vaultAddress: requestedVaultAddress,
    period,
    startTime: customStartTime,
    endTime: customEndTime,
  } = args as GetMorphoVaultSnapshotsParameters<environments, undefined>;

  // For V2 vaults, fetch snapshots using the paired V1 address.
  // Historical snapshots are indexed against V1 since that is where assets are held.
  // The original (V2) address is preserved so that returned snapshots carry the
  // address the caller requested, not the internal V1 address used for fetching.
  let fetchAddress = requestedVaultAddress;

  const matchedEntry = Object.entries(environment.config.vaults).find(
    ([, vaultConfig]) =>
      environment.config.tokens[
        vaultConfig.vaultToken as string
      ]?.address?.toLowerCase() === requestedVaultAddress.toLowerCase(),
  );

  if (matchedEntry !== undefined) {
    const [matchedVaultKey] = matchedEntry;
    const v1VaultKey = getV1VaultKey(environment, matchedVaultKey);

    if (v1VaultKey) {
      const v1Token = environment.config.tokens[v1VaultKey];
      if (v1Token?.address) {
        fetchAddress = v1Token.address;
      }
    }
  }

  const lunarIndexerUrl = environment.lunarIndexerUrl;

  if (!lunarIndexerUrl) {
    return [];
  }

  let snapshots: MorphoVaultSnapshot[];
  try {
    snapshots = await fetchVaultSnapshotsFromLunarIndexer(
      fetchAddress,
      environment.chainId,
      lunarIndexerUrl,
      period,
      customStartTime,
      customEndTime,
    );
  } catch (error) {
    console.warn(
      `[getMorphoVaultSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "morpho-vault-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }

  // Restore the originally-requested vault address on every snapshot so
  // callers keying by address see the V2 address they asked for.
  if (fetchAddress.toLowerCase() !== requestedVaultAddress.toLowerCase()) {
    return snapshots.map((s) => ({
      ...s,
      vaultAddress: requestedVaultAddress.toLowerCase(),
    }));
  }

  return snapshots;
}

async function fetchVaultSnapshotsFromLunarIndexer(
  vaultAddress: string,
  chainId: number,
  lunarIndexerUrl: string,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MorphoVaultSnapshot[]> {
  const vaultId = `${chainId}-${vaultAddress.toLowerCase()}`;
  const allSnapshots: MorphoVaultSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  const { startTime, endTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  do {
    const response = await fetchVaultSnapshotsFromIndexer(
      lunarIndexerUrl,
      vaultId,
      {
        limit: 1000,
        granularity: toApiGranularity(granularity),
        startTime,
        endTime,
        ...(cursor && { cursor }),
      },
    );

    const transformed = transformVaultSnapshotsFromIndexer(
      response.results,
      chainId,
    );

    allSnapshots.push(...transformed);
    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity);
}
