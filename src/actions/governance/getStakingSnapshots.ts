import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  calculateTimeRange,
  getEnvironmentFromArgs,
} from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import type { StakingSnapshot } from "../../types/staking.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
  shouldFallback,
} from "../lunar-indexer-client.js";
import { transformStakingSnapshots } from "../lunar-indexer-transformers.js";

dayjs.extend(utc);

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
  console.log("Fetching staking snapshots with args:", args);
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const period = (
    args as GetStakingSnapshotsParameters<environments, undefined>
  )?.period;
  const customStartTime = (
    args as GetStakingSnapshotsParameters<environments, undefined>
  )?.startTime;
  const customEndTime = (
    args as GetStakingSnapshotsParameters<environments, undefined>
  )?.endTime;

  if (environment.lunarIndexerUrl) {
    try {
      return await fetchStakingSnapshotsFromLunar(
        environment.chainId,
        environment.lunarIndexerUrl,
        period,
        customStartTime,
        customEndTime,
      );
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back to Ponder for staking snapshots:",
        error,
      );
    }
  }

  return fetchStakingSnapshotsFromPonder(
    environment.chainId,
    environment.indexerUrl,
  );
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

  const { startTime } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  const allSnapshots: StakingSnapshot[] = [];
  let cursor: string | null = null;

  do {
    const response = await lunarClient.getStakingSnapshots(chainId, {
      limit: 1000,
      granularity: "1d",
      startTime,
      ...(cursor && { cursor }),
    });

    allSnapshots.push(...transformStakingSnapshots(response.results));
    cursor = response.nextCursor;
  } while (cursor !== null);

  return allSnapshots;
}

async function fetchStakingSnapshotsFromPonder(
  chainId: number,
  indexerUrl: string,
): Promise<StakingSnapshot[]> {
  try {
    const response = await axios.post<{
      data: {
        stakingDailySnapshots: {
          items: StakingSnapshot[];
        };
      };
    }>(indexerUrl, {
      query: `
          query {
            stakingDailySnapshots(
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {chainId: ${chainId}}
            ) {
              items {
                chainId
                totalStaked
                totalStakedUSD
                timestamp
              }
            }
          }
        `,
    });

    if (response.status === 200 && response.data?.data?.stakingDailySnapshots) {
      return response.data?.data?.stakingDailySnapshots.items;
    } else {
      return [];
    }
  } catch (ex) {
    console.error("An error occured while fetching getStakingSnapshots...", ex);
    return [];
  }
}
