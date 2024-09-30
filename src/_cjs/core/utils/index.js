"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateApy = exports.perDay = exports.findTokenByAddress = exports.findMarketByAddress = void 0;
const index_js_1 = require("../../common/index.js");
const findMarketByAddress = (environment, address) => {
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
exports.findMarketByAddress = findMarketByAddress;
const findTokenByAddress = (environment, token) => Object.values(environment.config.tokens).find((r) => r.address === token);
exports.findTokenByAddress = findTokenByAddress;
const perDay = (value) => value * index_js_1.SECONDS_PER_DAY;
exports.perDay = perDay;
const calculateApy = (value) => ((value * index_js_1.SECONDS_PER_DAY + 1) ** index_js_1.DAYS_PER_YEAR - 1) * 100;
exports.calculateApy = calculateApy;
//# sourceMappingURL=index.js.map