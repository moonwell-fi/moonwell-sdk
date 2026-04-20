import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  toApiGranularity,
} from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import type { StakingSnapshot } from "../../types/staking.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
} from "../lunar-indexer-client.js";
import { transformStakingSnapshots } from "../lunar-indexer-transformers.js";

export type GetStakingSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  period?: SnapshotPeriod;
  startTime?: number;
  endTime?: number;
};

export type GetStakingSnapshotsReturnType = Promise<StakingSnapshot[]>;

export async function getStakingSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetStakingSnapshotsParameters<environments, Network>,
): GetStakingSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const {
    period,
    startTime: customStartTime,
    endTime: customEndTime,
  } = (args ?? {}) as GetStakingSnapshotsParameters<environments, undefined>;

  if (!environment.lunarIndexerUrl) {
    return [];
  }

  try {
    return await fetchStakingSnapshotsFromLunar(
      environment.chainId,
      environment.lunarIndexerUrl,
      period,
      customStartTime,
      customEndTime,
    );
  } catch (error) {
    console.warn(
      `[getStakingSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "staking-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }
}

async function fetchStakingSnapshotsFromLunar(
  chainId: number,
  lunarIndexerUrl: string,
  period?: SnapshotPeriod,
  customStartTime?: number,
  customEndTime?: number,
): Promise<StakingSnapshot[]> {
  const lunarClient = createLunarIndexerClient({
    baseUrl: lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const { startTime, endTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  const allSnapshots: StakingSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await lunarClient.getStakingSnapshots(chainId, {
      limit: 1000,
      granularity: toApiGranularity(granularity),
      startTime,
      endTime,
      ...(cursor && { cursor }),
    });

    allSnapshots.push(...transformStakingSnapshots(response.results));
    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity);
}
