import { createPublicClient, custom, getContract, } from "viem";
import { ChainLinkOracleAbi, ComptrollerTokenAbi, CoreRouterAbi, CoreViewsAbi, GovernanceTokenAbi, GovernorAbi, MarketTokenAbi, MorphoBlueAbi, MorphoBundlerAbi, MorphoPublicAllocatorAbi, MorphoViewsAbi, MultiRewardDistributorAbi, MultichainGovernorAbi, StakingTokenAbi, TemporalGovernorAbi, TokenAbi, VoteCollectorAbi, WrappedNativeTokenAbi, } from "../abis/index.js";
export const createTokenConfig = (tokens) => tokens;
export const createVaultConfig = (config) => config.vaults;
export const createMarketConfig = (config) => config.markets;
export const createMorphoMarketConfig = (config) => config.markets;
export const createContractsConfig = (config) => {
    return config.contracts;
};
export const createCustomConfig = (custom) => {
    return custom;
};
export const createEnvironmentConfig = (config) => {
    const publicClient = createPublicClient({
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
        return getContract({
            address,
            abi,
            client: publicClient,
        });
    };
    const getTokenContract = (key, abi) => {
        if (key) {
            const token = config.tokens[key];
            return getContract({
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
            [curr]: getTokenContract(curr, TokenAbi),
        };
    }, {});
    const marketContracts = Object.keys(config.markets).reduce((prev, curr) => {
        const market = config.markets[curr];
        return {
            ...prev,
            [curr]: getTokenContract(market.marketToken, MarketTokenAbi),
        };
    }, {});
    const vaultsContracts = Object.keys(config.vaults || {}).reduce((prev, curr) => {
        return {
            ...prev,
            [curr]: getTokenContract(curr, TokenAbi),
        };
    }, {});
    const contracts = Object.keys(config.contracts).reduce((prev, curr) => {
        const key = curr;
        const item = config.contracts[key];
        let abi = TokenAbi;
        switch (key) {
            case "comptroller":
                abi = ComptrollerTokenAbi;
                break;
            case "views":
                abi = CoreViewsAbi;
                break;
            case "morphoViews":
                abi = MorphoViewsAbi;
                break;
            case "multiRewardDistributor":
                abi = MultiRewardDistributorAbi;
                break;
            case "temporalGovernor":
                abi = TemporalGovernorAbi;
                break;
            case "voteCollector":
                abi = VoteCollectorAbi;
                break;
            case "governor":
                abi = GovernorAbi;
                break;
            case "multichainGovernor":
                abi = MultichainGovernorAbi;
                break;
            case "oracle":
                abi = ChainLinkOracleAbi;
                break;
            case "router":
                abi = CoreRouterAbi;
                break;
            case "morphoBlue":
                abi = MorphoBlueAbi;
                break;
            case "morphoBundler":
                abi = MorphoBundlerAbi;
                break;
            case "morphoPublicAllocator":
                abi = MorphoPublicAllocatorAbi;
                break;
            case "stakingToken":
                abi = StakingTokenAbi;
                break;
            case "governanceToken":
                abi = GovernanceTokenAbi;
                break;
            case "wrappedNativeToken":
                abi = WrappedNativeTokenAbi;
                break;
        }
        return {
            ...prev,
            [curr]: createContract(item, abi),
        };
    }, {});
    return {
        name: config.name,
        chainId: config.chain.id,
        indexerUrl: config.indexerUrl,
        tokens: tokenContracts,
        markets: marketContracts,
        vaults: vaultsContracts,
        contracts: contracts,
        custom,
        config: {
            tokens: config.tokens,
            contracts: config.contracts,
        },
    };
};
//# sourceMappingURL=config.js.map