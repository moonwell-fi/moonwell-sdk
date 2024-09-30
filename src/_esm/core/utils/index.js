import { DAYS_PER_YEAR, SECONDS_PER_DAY } from "../../common/index.js";
export const findMarketByAddress = (environment, address) => {
    const marketKey = Object.keys(environment.markets || {}).find((key) => {
        return environment.markets[key]?.address === address;
    });
    if (marketKey) {
        const marketConfig = environment.config.markets?.[marketKey];
        const marketToken = environment.config.tokens[marketConfig.marketToken];
        const underlyingToken = environment.config.tokens[marketConfig.underlyingToken];
        return {
            marketKey,
            marketConfig,
            marketToken,
            underlyingToken,
        };
    }
    else {
        return;
    }
};
export const findTokenByAddress = (environment, token) => Object.values(environment.config.tokens).find((r) => r.address === token);
export const perDay = (value) => value * SECONDS_PER_DAY;
export const calculateApy = (value) => ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;
//# sourceMappingURL=index.js.map