import { type Address, type Chain, type ChainContract, type Hex, type Narrow, type Prettify, type Transport } from "viem";
import type { GovernanceToken } from "../definitions/governance.js";
import type { ChainLinkOracleContractReturnType, ComptrollerContractReturnType, CoreRouterContractReturnType, CoreViewsContractReturnType, GovernanceTokenContractReturnType, GovernorContractReturnType, MarketTokenContractReturnType, MorphoBlueContractReturnType, MorphoBundlerContractReturnType, MorphoPublicAllocatorContractReturnType, MorphoVaultContractReturnType, MorphoViewsContractReturnType, MultiRewardDistributorContractReturnType, MultichainGovernorContractReturnType, StakingTokenContractReturnType, TemporalGovernorContractReturnType, TokenContractReturnType, VoteCollectorContractReturnType, WrappedNativeTokenContractReturnType } from "./contracts.js";
export type TokenConfig = {
    address: `0x${string}`;
    decimals: number;
    name: string;
    symbol: string;
};
export type VaultConfig<tokens> = {
    vaultToken: keyof tokens;
    underlyingToken: keyof tokens;
};
export type MarketConfig<tokens> = {
    marketToken: keyof tokens;
    underlyingToken: keyof tokens;
    deprecated?: boolean;
};
export type MorphoMarketConfig<tokens> = {
    collateralToken: keyof tokens;
    loanToken: keyof tokens;
    id: Hex;
};
export type ContractConfig<tokens> = {
    stakingToken: keyof tokens;
    governanceToken: keyof tokens;
    wrappedNativeToken: keyof tokens;
    comptroller: Address;
    views: Address;
    morphoViews?: Address;
    multiRewardDistributor?: Address;
    temporalGovernor?: Address;
    voteCollector?: Address;
    governor?: Address;
    multichainGovernor?: Address;
    oracle?: Address;
    router?: Address;
    morphoBlue?: Address;
    morphoBundler?: Address;
    morphoPublicAllocator?: Address;
};
export type ContractsConfigReturnType = {
    stakingToken: TokenContractReturnType;
    governanceToken: TokenContractReturnType;
    wrappedNativeToken: TokenContractReturnType;
    comptroller: ComptrollerContractReturnType;
    views: CoreViewsContractReturnType;
    morphoViews: MorphoViewsContractReturnType;
    multiRewardDistributor: MultiRewardDistributorContractReturnType;
    temporalGovernor: TemporalGovernorContractReturnType;
    voteCollector: VoteCollectorContractReturnType;
    governor: GovernorContractReturnType;
    multichainGovernor: MultichainGovernorContractReturnType;
    oracle: ChainLinkOracleContractReturnType;
    router: CoreRouterContractReturnType;
    morphoBlue: MorphoBlueContractReturnType;
    morphoBundler: MorphoBundlerContractReturnType;
    morphoPublicAllocator: MorphoPublicAllocatorContractReturnType;
};
export type CustomConfigType = {
    governance?: {
        token: GovernanceToken;
        chainIds: number[];
        proposalIdOffset?: number;
        snapshotEnsName?: string;
    };
    wormhole?: {
        chainId: number;
        tokenBridge?: ChainContract | undefined;
    };
    socket?: {
        gateway?: ChainContract | undefined;
    };
    xWELL?: {
        bridgeAdapter?: ChainContract | undefined;
    };
};
export type GetContractConfig<tokens, contract> = contract extends {} ? contract : keyof tokens;
export type TokensConfig<tokens> = {} extends tokens ? {} : {
    [tokenName in keyof tokens]: TokenConfig;
};
export type VaultsConfig<vaults, tokens> = {} extends vaults ? {} : {
    [name in keyof tokens]?: VaultConfig<tokens>;
};
export type MarketsConfig<markets, tokens> = {} extends markets ? {} : {
    [name in keyof tokens]?: MarketConfig<tokens>;
};
export type MorphoMarketsConfig<markets, tokens> = {} extends markets ? {} : {
    [name in keyof markets]: MorphoMarketConfig<tokens>;
};
export type ContractsConfig<contracts, tokens> = {} extends contracts ? {} : {
    [name in keyof ContractConfig<tokens>]?: ContractConfig<tokens>[name];
};
export type CustomConfig<custom> = {} extends custom ? {} : {
    [name in keyof CustomConfigType]?: CustomConfigType[name];
};
export declare const createTokenConfig: <const tokens>(tokens: TokensConfig<Narrow<tokens>>) => { [K in keyof tokens]: tokens[K]; };
export declare const createVaultConfig: <const tokens, const vaults>(config: {
    tokens: TokensConfig<tokens>;
    vaults: VaultsConfig<vaults, tokens>;
}) => { [K in keyof vaults]: vaults[K]; };
export declare const createMarketConfig: <const tokens, const markets>(config: {
    tokens: TokensConfig<tokens>;
    markets: MarketsConfig<markets, tokens>;
}) => { [K in keyof markets]: markets[K]; };
export declare const createMorphoMarketConfig: <const tokens, const markets>(config: {
    tokens: TokensConfig<tokens>;
    markets: MorphoMarketsConfig<markets, tokens>;
}) => { [K in keyof markets]: markets[K]; };
export declare const createContractsConfig: <const tokens, const contracts>(config: {
    tokens: TokensConfig<tokens>;
    contracts: ContractsConfig<contracts, tokens>;
}) => { [K in keyof contracts]: contracts[K]; };
export declare const createCustomConfig: <custom>(custom: CustomConfig<custom>) => { [K in keyof custom]: custom[K]; };
export declare const createEnvironmentConfig: <tokens, markets, vaults, morphoMarkets, contracts, custom>(config: {
    name: string;
    chain: Chain;
    transport: Transport;
    indexerUrl: string;
    tokens: TokensConfig<tokens>;
    markets: MarketsConfig<markets, tokens>;
    vaults: VaultsConfig<vaults, tokens>;
    morphoMarkets: MorphoMarketsConfig<morphoMarkets, tokens>;
    contracts: ContractsConfig<contracts, tokens>;
    custom: CustomConfig<custom>;
}) => Environment<tokens, markets, vaults, contracts, custom>;
export type Environment<tokens = any, markets = any, vaults = any, contracts = Partial<ContractsConfigReturnType>, custom = CustomConfigType> = {
    name: string;
    chainId: number;
    chain: Chain;
    indexerUrl: string;
    tokens: {
        [name in keyof tokens]: TokenContractReturnType;
    };
    markets: {
        [name in keyof markets]: MarketTokenContractReturnType;
    };
    vaults: {
        [name in keyof vaults]: MorphoVaultContractReturnType;
    };
    contracts: Prettify<{
        [name in keyof contracts as Extract<name, "stakingToken">]: StakingTokenContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "wrappedNativeToken">]: WrappedNativeTokenContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "governanceToken">]: GovernanceTokenContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "comptroller">]: ComptrollerContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "views">]: CoreViewsContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "morphoViews">]: MorphoViewsContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "multiRewardDistributor">]: MultiRewardDistributorContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "temporalGovernor">]: TemporalGovernorContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "voteCollector">]: VoteCollectorContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "governor">]: GovernorContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "multichainGovernor">]: MultichainGovernorContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "oracle">]: ChainLinkOracleContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "router">]: CoreRouterContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "morphoBlue">]: MorphoBlueContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "morphoBundler">]: MorphoBundlerContractReturnType;
    } & {
        [name in keyof contracts as Extract<name, "morphoPublicAllocator">]: MorphoPublicAllocatorContractReturnType;
    }>;
    custom: custom;
    config: {
        tokens: {
            [name in keyof tokens]: TokenConfig;
        };
        markets: {
            [name in keyof markets]: MarketConfig<Record<string, any>>;
        };
        vaults: {
            [name in keyof vaults]: VaultConfig<Record<string, any>>;
        };
        morphoMarkets: {
            [id: string]: MorphoMarketConfig<Record<string, any>>;
        };
        contracts: ContractConfig<Record<string, any>>;
    };
};
//# sourceMappingURL=config.d.ts.map