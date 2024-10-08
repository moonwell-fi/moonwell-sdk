import type { Environment } from "../environments/index.js";

import type { MoonwellClient } from "../client/createMoonwellClient.js";

export { Amount } from "./amount.js";
export { BaseError, HttpRequestError } from "./error.js";
export type { HttpRequestErrorType } from "./error.js";
export type { MultichainReturnType } from "./types.js";

export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_YEAR = 365;

export const perDay = (value: number) => value * SECONDS_PER_DAY;

export const calculateApy = (value: number) =>
  ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;

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
): Environment[] => {
  if (args) {
    const { chainId, network } = args as {
      chainId?: number;
      network?: keyof typeof client.environments;
    };

    if (chainId) {
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
  return Object.values(client.environments) as Environment[];
};
