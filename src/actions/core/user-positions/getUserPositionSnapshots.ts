import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  toApiGranularity,
} from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { UserPositionSnapshot } from "../../../types/userPosition.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
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
  if (!environment.lunarIndexerUrl) {
    return [];
  }
  return fetchUserPositionSnapshotsFromLunar(
    userAddress,
    environment,
    period,
    startTime,
    endTime,
    granularity,
  );
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
