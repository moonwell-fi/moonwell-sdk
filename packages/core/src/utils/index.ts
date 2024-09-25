import { DAYS_PER_YEAR, SECONDS_PER_DAY } from "@moonwell-sdk/common";
import type { Environment } from "@moonwell-sdk/environments";

export const findMarketByAddress = (environment: Environment, address: `0x${string}`) => {
  const marketKey = Object.keys(environment.contracts.core?.markets || {}).find((key) => {
    return environment.contracts.core?.markets[key]?.address === address;
  });

  if (marketKey) {
    const marketConfig = environment.config.contracts.core!.markets?.[marketKey]!;
    const marketToken = environment.tokens[marketConfig.marketToken]!;
    const underlyingToken = environment.tokens[marketConfig.underlyingToken]!;

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

export const findTokenByAddress = (environment: Environment, token: `0x${string}`) =>
  Object.values(environment.tokens).find((r) => r.address === token);

export const perDay = (value: number) => value * SECONDS_PER_DAY;

export const calculateApy = (value: number) => ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;
