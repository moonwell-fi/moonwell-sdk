"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markets = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.markets = (0, config_js_1.createMarketConfig)({
    tokens: tokens_js_1.tokens,
    markets: {
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC",
            underlyingToken: "USDC",
        },
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH",
            underlyingToken: "ETH",
        },
        MOONWELL_cbETH: {
            marketToken: "MOONWELL_cbETH",
            underlyingToken: "cbETH",
        },
        MOONWELL_wstETH: {
            marketToken: "MOONWELL_wstETH",
            underlyingToken: "wstETH",
        },
        MOONWELL_rETH: {
            marketToken: "MOONWELL_rETH",
            underlyingToken: "rETH",
        },
        MOONWELL_weETH: {
            marketToken: "MOONWELL_weETH",
            underlyingToken: "weETH",
        },
        MOONWELL_cbBTC: {
            marketToken: "MOONWELL_cbBTC",
            underlyingToken: "cbBTC",
        },
        MOONWELL_AERO: {
            marketToken: "MOONWELL_AERO",
            underlyingToken: "AERO",
        },
        MOONWELL_DAI: {
            marketToken: "MOONWELL_DAI",
            underlyingToken: "DAI",
        },
        MOONWELL_USDbC: {
            marketToken: "MOONWELL_USDbC",
            underlyingToken: "USDbC",
        },
    },
});
//# sourceMappingURL=core-markets.js.map