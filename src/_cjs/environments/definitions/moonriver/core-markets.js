"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markets = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.markets = (0, config_js_1.createMarketConfig)({
    tokens: tokens_js_1.tokens,
    markets: {
        MOONWELL_MOVR: {
            marketToken: "MOONWELL_MOVR",
            underlyingToken: "MOVR",
        },
        MOONWELL_xcKSM: {
            marketToken: "MOONWELL_xcKSM",
            underlyingToken: "xcKSM",
        },
        MOONWELL_FRAX: {
            marketToken: "MOONWELL_FRAX",
            underlyingToken: "FRAX",
        },
        MOONWELL_BTC: {
            marketToken: "MOONWELL_BTC",
            underlyingToken: "BTC",
        },
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC",
            underlyingToken: "USDC",
        },
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH",
            underlyingToken: "ETH",
        },
        MOONWELL_USDT: {
            marketToken: "MOONWELL_USDT",
            underlyingToken: "USDT",
        },
    },
});
//# sourceMappingURL=core-markets.js.map