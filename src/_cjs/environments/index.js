"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicEnvironments = exports.createEnvironment = exports.supportedChains = exports.optimism = exports.moonriver = exports.moonbeam = exports.GovernanceTokensConfig = exports.base = void 0;
const governance_js_1 = require("./definitions/governance.js");
Object.defineProperty(exports, "GovernanceTokensConfig", { enumerable: true, get: function () { return governance_js_1.GovernanceTokensConfig; } });
const environment_js_1 = require("./definitions/base/environment.js");
Object.defineProperty(exports, "base", { enumerable: true, get: function () { return environment_js_1.base; } });
const environment_js_2 = require("./definitions/moonbeam/environment.js");
const environment_js_3 = require("./definitions/moonriver/environment.js");
const environment_js_4 = require("./definitions/optimism/environment.js");
const chains_1 = require("viem/chains");
Object.defineProperty(exports, "moonbeam", { enumerable: true, get: function () { return chains_1.moonbeam; } });
Object.defineProperty(exports, "moonriver", { enumerable: true, get: function () { return chains_1.moonriver; } });
Object.defineProperty(exports, "optimism", { enumerable: true, get: function () { return chains_1.optimism; } });
const supportedChains = { base: environment_js_1.base, optimism: chains_1.optimism, moonriver: chains_1.moonriver, moonbeam: chains_1.moonbeam };
exports.supportedChains = supportedChains;
const createEnvironment = (config) => {
    switch (config.chain.id) {
        case environment_js_1.base.id:
            return (0, environment_js_1.createEnvironment)(config.rpcUrls, config.indexerUrl);
        case chains_1.moonbeam.id:
            return (0, environment_js_2.createEnvironment)(config.rpcUrls, config.indexerUrl);
        case chains_1.moonriver.id:
            return (0, environment_js_3.createEnvironment)(config.rpcUrls, config.indexerUrl);
        case chains_1.optimism.id:
            return (0, environment_js_4.createEnvironment)(config.rpcUrls, config.indexerUrl);
        default:
            throw new Error("Unsupported chainId");
    }
};
exports.createEnvironment = createEnvironment;
exports.publicEnvironments = {
    base: (0, environment_js_1.createEnvironment)(),
    moonbeam: (0, environment_js_2.createEnvironment)(),
    moonriver: (0, environment_js_3.createEnvironment)(),
    optimism: (0, environment_js_4.createEnvironment)(),
};
//# sourceMappingURL=index.js.map