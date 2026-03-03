import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { MoonwellClient } from "../client/createMoonwellClient.js";
import type { Environment } from "../environments/index.js";
export { Amount } from "./amount.js";
export { BaseError, HttpRequestError } from "./error.js";
export type { HttpRequestErrorType } from "./error.js";
export type { MultichainReturnType } from "./types.js";

dayjs.extend(utc);

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

/**
 * Calculate start and end times based on period or custom timestamps.
 * Priority: custom timestamps (both required) > period > default (365 days)
 */
export function calculateTimeRange(
  period?: "1M" | "3M" | "1Y" | "ALL",
  startTime?: number,
  endTime?: number,
): { startTime: number; endTime: number } {
  const now = dayjs.utc();
  const end = endTime ?? now.unix();

  // Use custom range only when both bounds are explicitly provided
  if (startTime !== undefined && endTime !== undefined) {
    return { startTime, endTime: end };
  }

  let start: number;
  switch (period) {
    case "1M":
      start = now.subtract(31, "days").unix();
      break;
    case "3M":
      start = now.subtract(91, "days").unix();
      break;
    case "1Y":
      start = now.subtract(366, "days").unix();
      break;
    case "ALL":
      start = now.subtract(10, "years").unix();
      break;
    default:
      start = now.subtract(365, "days").unix();
      break;
  }

  return { startTime: start, endTime: end };
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
