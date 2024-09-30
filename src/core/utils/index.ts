import { DAYS_PER_YEAR, SECONDS_PER_DAY } from "../../common/index.js";
import type { Environment } from "../../environments/index.js";

export const findMarketByAddress = (
  environment: Environment,
  address: `0x${string}`,
) => {
  const marketKey = Object.keys(environment.markets || {}).find((key) => {
    return environment.markets[key]?.address === address;
  });

  if (marketKey) {
    const marketConfig = environment.config.markets?.[marketKey]!;
    const marketToken =
      environment.config.tokens[marketConfig.marketToken as string]!;
    const underlyingToken =
      environment.config.tokens[marketConfig.underlyingToken as string]!;

    return {
      marketKey,
      marketConfig,
      marketToken,
      underlyingToken,
    };
  } else {
    return;
  }
};

export const findTokenByAddress = (
  environment: Environment,
  token: `0x${string}`,
) => Object.values(environment.config.tokens).find((r) => r.address === token);

export const perDay = (value: number) => value * SECONDS_PER_DAY;

export const calculateApy = (value: number) =>
  ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;
