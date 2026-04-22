import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
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
import type { MorphoVaultStakingSnapshot } from "../../../types/morphoVault.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
} from "../../lunar-indexer-client.js";
import { transformVaultStakingSnapshots } from "../../lunar-indexer-transformers.js";

export type GetMorphoVaultStakingSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    period?: SnapshotPeriod;
    startTime?: number;
    endTime?: number;
  };

export type GetMorphoVaultStakingSnapshotsReturnType = Promise<
  MorphoVaultStakingSnapshot[]
>;

export async function getMorphoVaultStakingSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultStakingSnapshotsParameters<environments, Network>,
): GetMorphoVaultStakingSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const {
    vaultAddress,
    period,
    startTime: customStartTime,
    endTime: customEndTime,
  } = args as GetMorphoVaultStakingSnapshotsParameters<environments, undefined>;

  const { lunarIndexerUrl } = environment;

  if (!lunarIndexerUrl) {
    return [];
  }

  try {
    return await fetchVaultStakingSnapshotsFromLunar(
      vaultAddress,
      lunarIndexerUrl,
      environment.chainId,
      period,
      customStartTime,
      customEndTime,
    );
  } catch (error) {
    console.warn(
      `[getMorphoVaultStakingSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "morpho-vault-staking-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }
}

async function fetchVaultStakingSnapshotsFromLunar(
  vaultAddress: string,
  lunarIndexerUrl: string,
  chainId: number,
  period?: SnapshotPeriod,
  customStartTime?: number,
  customEndTime?: number,
): Promise<MorphoVaultStakingSnapshot[]> {
  const lunarClient = createLunarIndexerClient({
    baseUrl: lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const { startTime, endTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  const allSnapshots: MorphoVaultStakingSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await lunarClient.getVaultStakingSnapshots(chainId, {
      limit: 1000,
      granularity: toApiGranularity(granularity),
      startTime,
      endTime,
      vaultAddress: vaultAddress.toLowerCase(),
      ...(cursor && { cursor }),
    });

    allSnapshots.push(...transformVaultStakingSnapshots(response.results));
    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity);
}
