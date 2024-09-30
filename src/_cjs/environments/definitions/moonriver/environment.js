"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = exports.markets = exports.createEnvironment = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const config_js_1 = require("../../types/config.js");
const contracts_js_1 = require("./contracts.js");
const core_markets_js_1 = require("./core-markets.js");
Object.defineProperty(exports, "markets", { enumerable: true, get: function () { return core_markets_js_1.markets; } });
const custom_js_1 = require("./custom.js");
const tokens_js_1 = require("./tokens.js");
Object.defineProperty(exports, "tokens", { enumerable: true, get: function () { return tokens_js_1.tokens; } });
const createEnvironment = (rpcUrls, indexerUrl) => (0, config_js_1.createEnvironmentConfig)({
    name: "Moonriver",
    chain: chains_1.moonriver,
    transport: rpcUrls
        ? (0, viem_1.fallback)(rpcUrls.map((url) => (0, viem_1.http)(url)))
        : (0, viem_1.http)(chains_1.moonriver.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens: tokens_js_1.tokens,
    markets: core_markets_js_1.markets,
    vaults: {},
    morphoMarkets: {},
    contracts: contracts_js_1.contracts,
    custom: custom_js_1.custom,
});
exports.createEnvironment = createEnvironment;
//# sourceMappingURL=environment.js.map