import axios from "axios";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  isStartOfDay,
  toApiGranularity,
} from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MorphoVaultStakingSnapshot } from "../../../types/morphoVault.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
  shouldFallback,
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
  if (lunarIndexerUrl) {
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
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back to Ponder for vault staking snapshots:",
        error,
      );
    }
  }

  const { startTime } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );
  return fetchVaultStakingSnapshotsFromPonder(
    vaultAddress,
    environment,
    startTime,
  );
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

interface VaultStakingData {
  totalStaked: number;
  totalStakedUSD: number;
  timestamp: number;
}

async function fetchVaultStakingSnapshotsFromPonder(
  vaultAddress: string,
  environment: Environment,
  startTime?: number,
): Promise<MorphoVaultStakingSnapshot[]> {
  const dailyData: VaultStakingData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        vaultStakingDailySnapshots: {
          items: VaultStakingData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            vaultStakingDailySnapshots (
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {vaultAddress: "${vaultAddress.toLowerCase()}", chainId: ${environment.chainId}}
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                  totalStaked
                  totalStakedUSD
                  timestamp
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
    });

    if (result.data.data.vaultStakingDailySnapshots) {
      dailyData.push(
        ...result.data.data.vaultStakingDailySnapshots.items.filter(
          (f: { timestamp: number }) =>
            isStartOfDay(f.timestamp) &&
            (startTime === undefined || f.timestamp >= startTime),
        ),
      );
      hasNextPage =
        result.data.data.vaultStakingDailySnapshots.pageInfo.hasNextPage;
      endCursor =
        result.data.data.vaultStakingDailySnapshots.pageInfo.endCursor;
    }
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: VaultStakingData) => ({
      vaultAddress: vaultAddress.toLowerCase(),
      chainId: environment.chainId,
      timestamp: point.timestamp * 1000,
      totalStaked: Number(point.totalStaked),
      totalStakedUsd: Number(point.totalStakedUSD),
    }));
  } else {
    return [];
  }
}
