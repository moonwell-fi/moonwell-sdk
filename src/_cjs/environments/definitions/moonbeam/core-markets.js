"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markets = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.markets = (0, config_js_1.createMarketConfig)({
    tokens: tokens_js_1.tokens,
    markets: {
        MOONWELL_GLMR: {
            marketToken: "MOONWELL_GLMR",
            underlyingToken: "GLMR",
        },
        MOONWELL_xcDOT: {
            marketToken: "MOONWELL_xcDOT",
            underlyingToken: "xcDOT",
        },
        MOONWELL_FRAX: {
            marketToken: "MOONWELL_FRAX",
            underlyingToken: "FRAX",
        },
        MOONWELL_xcUSDC: {
            marketToken: "MOONWELL_xcUSDC",
            underlyingToken: "xcUSDC",
        },
        MOONWELL_xcUSDT: {
            marketToken: "MOONWELL_xcUSDT",
            underlyingToken: "xcUSDT",
        },
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH",
            underlyingToken: "ETH",
        },
        MOONWELL_BTC: {
            marketToken: "MOONWELL_BTC",
            underlyingToken: "BTC",
        },
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC",
            underlyingToken: "USDC",
        },
        MOONWELL_BUSD: {
            marketToken: "MOONWELL_BUSD",
            underlyingToken: "BUSD",
        },
    },
});
//# sourceMappingURL=core-markets.js.map