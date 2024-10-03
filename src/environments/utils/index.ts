import type { Environment } from "../types/config.js";

export const findMarketByAddress = (
  environment: Environment,
  address: `0x${string}`,
) => {
  const marketKey = Object.keys(environment.markets || {}).find((key) => {
    return (
      environment.markets[key]?.address.toLowerCase() === address.toLowerCase()
    );
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
) =>
  Object.values(environment.config.tokens).find(
    (r) => r.address.toLowerCase() === token.toLowerCase(),
  );
