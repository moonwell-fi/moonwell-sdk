import { GovernanceTokensConfig, } from "./definitions/governance.js";
import { base, createEnvironment as createBaseEnvironment, } from "./definitions/base/environment.js";
import { createEnvironment as createMoonbeamEnvironment, } from "./definitions/moonbeam/environment.js";
import { createEnvironment as createMoonriverEnvironment, } from "./definitions/moonriver/environment.js";
import { createEnvironment as createOptimismEnvironment, } from "./definitions/optimism/environment.js";
import { moonbeam, moonriver, optimism } from "viem/chains";
export { base, GovernanceTokensConfig, moonbeam, moonriver, optimism, supportedChains, };
const supportedChains = { base, optimism, moonriver, moonbeam };
export const createEnvironment = (config) => {
    switch (config.chain.id) {
        case base.id:
            return createBaseEnvironment(config.rpcUrls, config.indexerUrl);
        case moonbeam.id:
            return createMoonbeamEnvironment(config.rpcUrls, config.indexerUrl);
        case moonriver.id:
            return createMoonriverEnvironment(config.rpcUrls, config.indexerUrl);
        case optimism.id:
            return createOptimismEnvironment(config.rpcUrls, config.indexerUrl);
        default:
            throw new Error("Unsupported chainId");
    }
};
export const publicEnvironments = {
    base: createBaseEnvironment(),
    moonbeam: createMoonbeamEnvironment(),
    moonriver: createMoonriverEnvironment(),
    optimism: createOptimismEnvironment(),
};
//# sourceMappingURL=index.js.map