import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { MoonwellClient } from "../client/createMoonwellClient.js";
import type { Environment } from "../environments/index.js";

dayjs.extend(utc);
export { Amount } from "./amount.js";
export { BaseError, HttpRequestError } from "./error.js";
export type { HttpRequestErrorType } from "./error.js";
export type { MultichainReturnType } from "./types.js";

export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_YEAR = 365;

export const perDay = (value: number) => value * SECONDS_PER_DAY;

export function isStartOfDay(timestamp: number): boolean {
  const startOfDay = dayjs
    .utc(timestamp * 1000)
    .startOf("day")
    .unix();
  return startOfDay === timestamp;
}

export const calculateApy = (value: number) =>
  ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;

export type SnapshotPeriod = "1M" | "3M" | "1Y" | "ALL";
export type SnapshotGranularity = "6h" | "1d" | "7d" | "14d" | "30d";

/**
 * Filter snapshots to keep every Nth data point based on granularity.
 * "6h" and "1d" are handled natively by the API — no client-side filtering applied.
 * Coarser granularities (7d, 14d, 30d) fetch "1d" from the API and thin here.
 *
 * Callers must sort snapshots ascending by timestamp before calling this function.
 * Always keeps index 0, N, 2N, … so the oldest data point is always retained.
 */
export function applyGranularity<T extends { timestamp: number }>(
  snapshots: T[],
  granularity: SnapshotGranularity,
): T[] {
  const step: Record<SnapshotGranularity, number> = {
    "6h": 1,
    "1d": 1,
    "7d": 7,
    "14d": 14,
    "30d": 30,
  };
  const n = step[granularity];
  if (n <= 1) return snapshots;
  return snapshots.filter((_, i) => i % n === 0);
}

/**
 * Map a SnapshotGranularity to the value passed to the lunar indexer API.
 * "6h" is natively supported; coarser granularities (7d, 14d, 30d) are not,
 * so we fetch "1d" and thin client-side via applyGranularity.
 */
export function toApiGranularity(
  granularity: SnapshotGranularity,
): "6h" | "1d" {
  return granularity === "6h" ? "6h" : "1d";
}

/**
 * Calculate start/end times and display granularity based on period or custom timestamps.
 * Priority: custom timestamps > period > default (365 days)
 *
 * Granularity per period:
 *   1M  → 6h  (4 data points per day, API-native)
 *   3M  → 1d  (one data point per day)
 *   1Y  → 7d  (one data point every 7 days, client-side filtered)
 *   ALL → 14d (one data point every 14 days, client-side filtered)
 */
export function calculateTimeRange(
  period?: SnapshotPeriod,
  startTime?: number,
  endTime?: number,
): { startTime: number; endTime: number; granularity: SnapshotGranularity } {
  const now = dayjs.utc();
  const end = endTime ?? now.unix();
  if (startTime !== undefined) {
    return { startTime, endTime: end, granularity: "1d" };
  }
  let start: number;
  let granularity: SnapshotGranularity;
  switch (period) {
    case "1M":
      start = now.subtract(31, "days").unix();
      granularity = "6h";
      break;
    case "3M":
      start = now.subtract(91, "days").unix();
      granularity = "1d";
      break;
    case "1Y":
      start = now.subtract(366, "days").unix();
      granularity = "7d";
      break;
    case "ALL":
      start = now.subtract(3, "years").unix();
      granularity = "14d";
      break;
    case undefined:
      start = now.subtract(366, "days").unix();
      granularity = "1d";
      break;
  }

  return { startTime: start, endTime: end, granularity };
}

export const getEnvironmentFromArgs = (
  client: MoonwellClient,
  args?: { chainId?: number; network?: any },
) => {
  if (args) {
    const { chainId, network } = args as {
      chainId?: number;
      network?: keyof typeof client.environments;
    };

    if (chainId) {
      return Object.values(client.environments).find(
        (env) => env.chainId === chainId,
      ) as Environment;
    }

    if (network) {
      return client.environments[network] as Environment;
    }
  }

  return undefined;
};

export const getEnvironmentsFromArgs = (
  client: MoonwellClient,
  args?: { chainId?: number; network?: any },
  onlyWithDeployment?: boolean,
): Environment[] => {
  const onlyEnvironmentsWithDeployment =
    onlyWithDeployment !== undefined ? onlyWithDeployment : true;
  if (args) {
    const { chainId, network } = args as {
      chainId?: number;
      network?: keyof typeof client.environments;
    };

    if (Number.isInteger(chainId)) {
      return [
        Object.values(client.environments).find(
          (env) => env.chainId === chainId,
        ),
      ] as Environment[];
    }

    if (network) {
      return [client.environments[network]] as Environment[];
    }
  }
  return Object.values(client.environments as Environment[]).filter((r) =>
    onlyEnvironmentsWithDeployment ? r.contracts.views !== undefined : true,
  );
};
