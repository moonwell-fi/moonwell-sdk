import axios from "axios";
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  isStartOfDay,
  toApiGranularity,
} from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { UserPositionSnapshot } from "../../../types/userPosition.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
  shouldFallback,
} from "../../lunar-indexer-client.js";
import { transformPortfolioToSnapshots } from "../../lunar-indexer-transformers.js";

export type GetUserPositionSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
  /** Predefined time period for snapshots */
  period?: SnapshotPeriod;
  /** Custom start time (unix timestamp in seconds). Overrides period if both startTime and endTime are provided. */
  startTime?: number;
  /** Custom end time (unix timestamp in seconds). Overrides period if both startTime and endTime are provided. */
  endTime?: number;
  /** Data granularity. Defaults to "1d" */
  granularity?: "6h" | "1d";
};

export type GetUserPositionSnapshotsReturnType = Promise<
  UserPositionSnapshot[]
>;

/**
 * Get historical snapshots of a user's positions across all markets
 *
 * @param client - Moonwell client instance
 * @param args - Parameters including user address and optional time range
 * @param args.userAddress - The user's wallet address
 * @param args.period - Predefined time period: "1M" (31 days), "3M" (91 days), "1Y" (366 days), or "ALL" (all available history)
 * @param args.startTime - Custom start time (unix timestamp in seconds). Overrides period if both startTime and endTime are provided.
 * @param args.endTime - Custom end time (unix timestamp in seconds). Overrides period if both startTime and endTime are provided.
 * @param args.granularity - Data granularity: "6h" or "1d". Determines snapshot frequency.
 *
 * @returns Array of user position snapshots with USD values for supply, borrow, and collateral
 *
 * @remarks
 * - Default behavior (no time parameters): Returns 365 days of history
 * - Parameter priority: Custom timestamps > period > default (365 days)
 * - When using Lunar Indexer, custom time ranges are supported
 * - When falling back to Ponder, all available data is returned (client-side filtering may be needed)
 * - Snapshots are filtered to start-of-day for "1d" granularity
 */
export async function getUserPositionSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionSnapshotsParameters<environments, Network>,
): GetUserPositionSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  return fetchUserPositionSnapshots(
    args.userAddress,
    environment,
    args.period,
    args.startTime,
    args.endTime,
    args.granularity,
  );
}

async function fetchUserPositionSnapshots(
  userAddress: Address,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  startTime?: number,
  endTime?: number,
  granularity?: "6h" | "1d",
): Promise<UserPositionSnapshot[]> {
  if (environment.lunarIndexerUrl) {
    try {
      const result = await fetchUserPositionSnapshotsFromLunar(
        userAddress,
        environment,
        period,
        startTime,
        endTime,
        granularity,
      );
      return result;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back to Ponder for user snapshots:",
        error,
      );
    }
  }

  // Ponder fallback returns all available data (doesn't support time filtering)
  const result = await fetchUserPositionSnapshotsFromPonder(
    userAddress,
    environment,
  );
  return result;
}

async function fetchUserPositionSnapshotsFromLunar(
  userAddress: Address,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
  granularity?: "6h" | "1d",
): Promise<UserPositionSnapshot[]> {
  if (!environment.lunarIndexerUrl) {
    throw new Error("Lunar Indexer URL not configured");
  }

  const client = createLunarIndexerClient({
    baseUrl: environment.lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const {
    startTime,
    endTime,
    granularity: derivedGranularity,
  } = calculateTimeRange(period, customStartTime, customEndTime);

  const resolvedGranularity = granularity ?? derivedGranularity;

  const portfolio = await client.getAccountPortfolio(
    userAddress.toLowerCase(),
    {
      startTime,
      endTime,
      granularity: toApiGranularity(resolvedGranularity),
      chainId: environment.chainId,
    },
  );

  const snapshots = transformPortfolioToSnapshots(
    portfolio,
    environment.chainId,
  ).sort((a, b) => a.timestamp - b.timestamp);

  // Find the first snapshot where user has any position
  const firstNonZeroIndex = snapshots.findIndex(
    (snapshot) =>
      snapshot.totalSupplyUsd > 0 ||
      snapshot.totalBorrowsUsd > 0 ||
      snapshot.totalCollateralUsd > 0,
  );

  if (firstNonZeroIndex === -1) {
    return [];
  }

  return applyGranularity(
    snapshots.slice(firstNonZeroIndex),
    resolvedGranularity,
  );
}

async function fetchUserPositionSnapshotsFromPonder(
  userAddress: Address,
  environment: Environment,
): Promise<UserPositionSnapshot[]> {
  const dailyData: UserDailyData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface UserDailyData {
    totalBorrowsUSD: string;
    totalSuppliesUSD: string;
    totalCollateralUSD: string;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        accountDailySnapshots: {
          items: UserDailyData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            accountDailySnapshots(
              limit: 365,
              orderDirection: "desc",
              orderBy: "timestamp",
              where: { accountAddress: "${userAddress.toLowerCase()}", chainId: ${environment.chainId} }
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                timestamp,
                totalBorrowsUSD,
                totalSuppliesUSD,
                totalCollateralUSD,
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
    });

    dailyData.push(
      ...result.data.data.accountDailySnapshots.items.filter(
        (f: { timestamp: number }) => isStartOfDay(f.timestamp),
      ),
    );
    hasNextPage = result.data.data.accountDailySnapshots.pageInfo.hasNextPage;
    endCursor = result.data.data.accountDailySnapshots.pageInfo.endCursor;
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: UserDailyData) => {
      const borrowUsd = Number(point.totalBorrowsUSD);
      const suppliedUsd = Number(point.totalSuppliesUSD);
      const collateralUsd = Number(point.totalCollateralUSD);

      const result: UserPositionSnapshot = {
        chainId: environment.chainId,
        timestamp: point.timestamp * 1000,
        totalSupplyUsd: suppliedUsd,
        totalBorrowsUsd: borrowUsd,
        totalCollateralUsd: collateralUsd,
      };

      return result;
    });
  } else {
    return [];
  }
}
