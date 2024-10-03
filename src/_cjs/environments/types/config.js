"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentConfig = exports.createCustomConfig = exports.createContractsConfig = exports.createMorphoMarketConfig = exports.createMarketConfig = exports.createVaultConfig = exports.createTokenConfig = void 0;
const viem_1 = require("viem");
const index_js_1 = require("../abis/index.js");
const createTokenConfig = (tokens) => tokens;
exports.createTokenConfig = createTokenConfig;
const createVaultConfig = (config) => config.vaults;
exports.createVaultConfig = createVaultConfig;
const createMarketConfig = (config) => config.markets;
exports.createMarketConfig = createMarketConfig;
const createMorphoMarketConfig = (config) => config.markets;
exports.createMorphoMarketConfig = createMorphoMarketConfig;
const createContractsConfig = (config) => {
    return config.contracts;
};
exports.createContractsConfig = createContractsConfig;
const createCustomConfig = (custom) => {
    return custom;
};
exports.createCustomConfig = createCustomConfig;
const createEnvironmentConfig = (config) => {
    const publicClient = (0, viem_1.createPublicClient)({
        chain: config.chain,
        batch: {
            multicall: {
                wait: 100,
            },
        },
        cacheTime: 5000,
        transport: config.transport,
    });
    const createContract = (address, abi) => {
        return (0, viem_1.getContract)({
            address,
            abi,
            client: publicClient,
        });
    };
    const getTokenContract = (key, abi) => {
        if (key) {
            const token = config.tokens[key];
            return (0, viem_1.getContract)({
                address: token.address,
                abi,
                client: publicClient,
            });
        }
        else {
            return undefined;
        }
    };
    const tokenContracts = Object.keys(config.tokens).reduce((prev, curr) => {
        return {
            ...prev,
            [curr]: getTokenContract(curr, index_js_1.TokenAbi),
        };
    }, {});
    const marketContracts = Object.keys(config.markets).reduce((prev, curr) => {
        const market = config.markets[curr];
        return {
            ...prev,
            [curr]: getTokenContract(market.marketToken, index_js_1.MarketTokenAbi),
        };
    }, {});
    const vaultsContracts = Object.keys(config.vaults || {}).reduce((prev, curr) => {
        return {
            ...prev,
            [curr]: getTokenContract(curr, index_js_1.MorphoVaultAbi),
        };
    }, {});
    const contracts = Object.keys(config.contracts).reduce((prev, curr) => {
        const key = curr;
        let contractAddress = config.contracts[key];
        let abi = index_js_1.TokenAbi;
        switch (key) {
            case "comptroller":
                abi = index_js_1.ComptrollerTokenAbi;
                break;
            case "views":
                abi = index_js_1.CoreViewsAbi;
                break;
            case "morphoViews":
                abi = index_js_1.MorphoViewsAbi;
                break;
            case "multiRewardDistributor":
                abi = index_js_1.MultiRewardDistributorAbi;
                break;
            case "temporalGovernor":
                abi = index_js_1.TemporalGovernorAbi;
                break;
            case "voteCollector":
                abi = index_js_1.VoteCollectorAbi;
                break;
            case "governor":
                abi = index_js_1.GovernorAbi;
                break;
            case "multichainGovernor":
                abi = index_js_1.MultichainGovernorAbi;
                break;
            case "oracle":
                abi = index_js_1.ChainLinkOracleAbi;
                break;
            case "router":
                abi = index_js_1.CoreRouterAbi;
                break;
            case "morphoBlue":
                abi = index_js_1.MorphoBlueAbi;
                break;
            case "morphoBundler":
                abi = index_js_1.MorphoBundlerAbi;
                break;
            case "morphoPublicAllocator":
                abi = index_js_1.MorphoPublicAllocatorAbi;
                break;
            case "stakingToken":
                contractAddress = config.tokens[contractAddress].address;
                abi = index_js_1.StakingTokenAbi;
                break;
            case "governanceToken":
                contractAddress = config.tokens[contractAddress].address;
                abi = index_js_1.GovernanceTokenAbi;
                break;
            case "wrappedNativeToken":
                contractAddress = config.tokens[contractAddress].address;
                abi = index_js_1.WrappedNativeTokenAbi;
                break;
        }
        return {
            ...prev,
            [curr]: createContract(contractAddress, abi),
        };
    }, {});
    return {
        name: config.name,
        chainId: config.chain.id,
        chain: config.chain,
        indexerUrl: config.indexerUrl,
        tokens: tokenContracts,
        markets: marketContracts,
        vaults: vaultsContracts,
        contracts: contracts,
        custom: config.custom,
        config: {
            tokens: config.tokens,
            vaults: config.vaults,
            markets: config.markets,
            morphoMarkets: config.morphoMarkets,
            contracts: config.contracts,
        },
    };
};
exports.createEnvironmentConfig = createEnvironmentConfig;
//# sourceMappingURL=config.js.map