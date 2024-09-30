"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = exports.vaults = exports.morphoMarkets = exports.markets = exports.createEnvironment = exports.base = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const config_js_1 = require("../../types/config.js");
const contracts_js_1 = require("./contracts.js");
const core_markets_js_1 = require("./core-markets.js");
Object.defineProperty(exports, "markets", { enumerable: true, get: function () { return core_markets_js_1.markets; } });
const custom_js_1 = require("./custom.js");
const morpho_markets_js_1 = require("./morpho-markets.js");
Object.defineProperty(exports, "morphoMarkets", { enumerable: true, get: function () { return morpho_markets_js_1.morphoMarkets; } });
const morpho_vaults_js_1 = require("./morpho-vaults.js");
Object.defineProperty(exports, "vaults", { enumerable: true, get: function () { return morpho_vaults_js_1.vaults; } });
const tokens_js_1 = require("./tokens.js");
Object.defineProperty(exports, "tokens", { enumerable: true, get: function () { return tokens_js_1.tokens; } });
const base = (0, viem_1.defineChain)({ ...chains_1.base, testnet: false });
exports.base = base;
const createEnvironment = (rpcUrls, indexerUrl) => (0, config_js_1.createEnvironmentConfig)({
    name: "Base",
    chain: base,
    transport: rpcUrls
        ? (0, viem_1.fallback)(rpcUrls.map((url) => (0, viem_1.http)(url)))
        : (0, viem_1.http)(base.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    tokens: tokens_js_1.tokens,
    markets: core_markets_js_1.markets,
    vaults: morpho_vaults_js_1.vaults,
    morphoMarkets: morpho_markets_js_1.morphoMarkets,
    contracts: contracts_js_1.contracts,
    custom: custom_js_1.custom,
});
exports.createEnvironment = createEnvironment;
//# sourceMappingURL=environment.js.map