import {
  ChainLinkOracleAbi,
  ComptrollerTokenAbi,
  CoreRouterAbi,
  CoreViewsAbi,
  GovernanceTokenAbi,
  GovernorAbi,
  MarketTokenAbi,
  MorphoBlueAbi,
  MorphoBundlerAbi,
  MorphoPublicAllocatorAbi,
  MorphoVaultAbi,
  MorphoViewsAbi,
  MultiRewardDistributorAbi,
  MultichainGovernorAbi,
  StakingTokenAbi,
  TemporalGovernorAbi,
  TokenAbi,
  VoteCollectorAbi,
  WrappedNativeTokenAbi,
} from "../abis/index.js";

import {
  http,
  type Abi,
  type Address,
  type Hex,
  type Narrow,
  type Prettify,
  type PublicClient,
  createPublicClient,
  fallback,
  getContract as viem_getContract,
} from "viem";

import type {
  ChainLinkOracleContractReturnType,
  ComptrollerContractReturnType,
  CoreRouterContractReturnType,
  CoreViewsContractReturnType,
  GovernanceTokenContractReturnType,
  GovernorContractReturnType,
  MarketTokenContractReturnType,
  MorphoBlueContractReturnType,
  MorphoBundlerContractReturnType,
  MorphoPublicAllocatorContractReturnType,
  MorphoVaultContractReturnType,
  MorphoViewsContractReturnType,
  MultiRewardDistributorContractReturnType,
  MultichainGovernorContractReturnType,
  StakingTokenContractReturnType,
  TemporalGovernorContractReturnType,
  TokenContractReturnType,
  VoteCollectorContractReturnType,
  WrappedNativeTokenContractReturnType,
} from "./contracts.js";

import type { GovernanceToken } from "./../definitions/governance.js";
import type { Network } from "./network.js";

export type TokenConfig = {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;
};

export type GetTokenConfig<token = unknown> = token extends {} ? TokenConfig : TokenConfig;

export type TokensConfig<tokenList> = {
  [name in keyof tokenList]: GetTokenConfig<tokenList[name]>;
};

export const createTokenList = <const tokenList = {}>(tokens: TokensConfig<Narrow<tokenList>>): TokensConfig<Narrow<tokenList>> =>
  tokens as TokensConfig<Narrow<tokenList>>;

export type EnvironmentTokensConfig<tokenList> = TokensConfig<tokenList>;

export type VaultConfig<tokenList> = {
  vaultToken: keyof tokenList;
  underlyingToken: keyof tokenList;
};

export type VaultsConfig<vaultList, tokenList> = {} extends vaultList
  ? {}
  : {
      [name in keyof vaultList]: VaultConfig<tokenList>;
    };

export const createVaultList = <const tokenList, const vaultList>(config: {
  tokens: TokensConfig<tokenList>;
  vaults: VaultsConfig<vaultList, tokenList>;
}): VaultsConfig<Narrow<vaultList>, tokenList> => config.vaults as VaultsConfig<Narrow<vaultList>, tokenList>;

export type MarketConfig<tokenList> = {
  marketToken: keyof tokenList;
  underlyingToken: keyof tokenList;
  deprecated?: boolean;
};

export type MarketsConfig<marketList, tokenList> = {} extends tokenList
  ? // contracts empty, return empty
    {}
  : {
      [name in keyof marketList]: MarketConfig<tokenList>;
    };

export const createMarketList = <const tokenList, const marketList>(config: {
  tokens: TokensConfig<tokenList>;
  markets: MarketsConfig<marketList, tokenList>;
}): MarketsConfig<Narrow<marketList>, tokenList> => config.markets as MarketsConfig<Narrow<marketList>, tokenList>;

export type MorphoMarketConfig<tokenList> = {
  collateralToken: keyof tokenList;
  loanToken: keyof tokenList;
  id: Hex;
};

export type MorphoMarketsConfig<marketList, tokenList> = {} extends marketList
  ? // contracts empty, return empty
    {}
  : {
      [name in keyof marketList]: MorphoMarketConfig<tokenList>;
    };

export const createMorphoMarketList = <const tokenList, const marketList>(config: {
  tokens: TokensConfig<tokenList>;
  markets: MorphoMarketsConfig<marketList, tokenList>;
}): MorphoMarketsConfig<Narrow<marketList>, tokenList> => config.markets as MorphoMarketsConfig<Narrow<marketList>, tokenList>;

export type EnvironmentApiConfig = {
  indexerUrl: `https://${string}`;
  rpcUrls: string[];
};

export type EnvironmentGovernanceSettingsConfig = {
  governance?: {
    token: GovernanceToken;
    chainIds: number[];
    proposalIdOffset?: number;
    snapshotEnsName?: string;
  };
};

export type EnvironmentContractsConfig<tokenList = {}> = {
  stakingToken?: keyof tokenList;
  wrappedNativeToken?: keyof tokenList;
  governanceToken?: keyof tokenList;
  core?: EnvironmentContractsCoreConfig<tokenList>;
  morpho?: EnvironmentContractsMorphoConfig<tokenList>;
};

export type EnvironmentContractsCoreConfig<tokenList = Record<string, TokenConfig>> = {
  comptroller: Address;
  views: Address;
  markets?: {
    [name in keyof tokenList]?: {
      marketToken: keyof tokenList;
      underlyingToken: keyof tokenList;
      deprecated?: boolean;
    };
  };
  morphoViews?: Address | undefined;
  multiRewardDistributor?: Address | undefined;
  temporalGovernor?: Address | undefined;
  voteCollector?: Address | undefined;
  governor?: Address | undefined;
  multichainGovernor?: Address | undefined;
  oracle?: Address | undefined;
  router?: Address | undefined;
};

export type EnvironmentContractsMorphoConfig<tokenList = Record<string, TokenConfig>> = {
  blue: Address;
  bundler: Address;
  publicAllocator: Address;
  views: Address;
  vaults?: {
    [name in keyof tokenList]?: {
      vaultToken: keyof tokenList;
      underlyingToken: keyof tokenList;
    };
  };
  markets?: {
    [key: string]: {
      collateralToken: keyof tokenList;
      loanToken: keyof tokenList;
      id: Hex;
    };
  };
};

export type EnvironmentContractsCore<marketList = any> = {
  comptroller: ComptrollerContractReturnType;
  views: CoreViewsContractReturnType;
  markets: { [name in keyof marketList]: MarketTokenContractReturnType };
  multiRewardDistributor?: MultiRewardDistributorContractReturnType | undefined;
  temporalGovernor?: TemporalGovernorContractReturnType | undefined;
  voteCollector?: VoteCollectorContractReturnType | undefined;
  governor?: GovernorContractReturnType | undefined;
  multichainGovernor?: MultichainGovernorContractReturnType | undefined;
  oracle?: ChainLinkOracleContractReturnType | undefined;
  router?: CoreRouterContractReturnType | undefined;
};

export type EnvironmentContractsMorpho<vaultList = any> = {
  blue: MorphoBlueContractReturnType | undefined;
  bundler: MorphoBundlerContractReturnType | undefined;
  publicAllocator: MorphoPublicAllocatorContractReturnType | undefined;
  views: MorphoViewsContractReturnType | undefined;
  vaults?: {
    [name in keyof vaultList]: MorphoVaultContractReturnType;
  };
};

export type EnvironmentContracts<tokenList = any, marketList = any, vaultList = any> = {
  tokens?: {
    [name in keyof tokenList]: TokenContractReturnType;
  };
  stakingToken?: StakingTokenContractReturnType;
  wrappedNativeToken?: WrappedNativeTokenContractReturnType;
  governanceToken?: GovernanceTokenContractReturnType;
  core?: EnvironmentContractsCore<marketList> | undefined;
  morpho?: EnvironmentContractsMorpho<vaultList> | undefined;
};

export type Environment<
  tokenList = Record<string, TokenConfig>,
  marketList = Record<string, TokenConfig>,
  vaultList = Record<string, TokenConfig>,
> = {
  name: string;
  network: Network;
  apis: EnvironmentApiConfig;
  tokens: EnvironmentTokensConfig<tokenList>;
  contracts: EnvironmentContracts<tokenList, marketList, vaultList>;
  settings?: Prettify<EnvironmentGovernanceSettingsConfig>;
  config: EnvironmentConfig<tokenList>;
  client: PublicClient;
};

export type EnvironmentConfig<tokenList = any> = {
  name: string;
  network: Network;
  apis: EnvironmentApiConfig;
  tokens: EnvironmentTokensConfig<tokenList>;
  contracts: EnvironmentContractsConfig<tokenList>;
  settings?: Prettify<EnvironmentGovernanceSettingsConfig>;
};

const getNetworkRpcUrls = (config: EnvironmentConfig) => {
  const urls: string[] = [...config.apis.rpcUrls, ...config.network.chain.rpcUrls.default.http.map((url) => url)];
  return urls;
};

export const createEnvironmenConfig = <const tokenList, const marketList = {}, const vaultList = {}>(
  config: EnvironmentConfig<tokenList>,
): Prettify<Environment<tokenList, marketList, vaultList>> => {
  const publicClient = createPublicClient({
    chain: config.network.chain,
    batch: {
      multicall: {
        wait: 100,
      },
    },
    cacheTime: 5_000,
    transport: fallback(getNetworkRpcUrls(config).map((url) => http(url, { timeout: 5_000 }))),
  });

  const getContract = <const abi extends Abi>(address: Address, abi: abi) => {
    return viem_getContract({
      address,
      abi,
      client: publicClient,
    });
  };

  const getContractOrUndefined = <const abi extends Abi>(address: Address | undefined, abi: abi) => {
    if (address) {
      return viem_getContract({ address: address, abi, client: publicClient });
    } else {
      return undefined;
    }
  };

  const getTokenContract = <const abi extends Abi>(key: keyof tokenList | undefined, abi: abi) => {
    if (key) {
      const token = config.tokens[key] as TokenConfig;
      return viem_getContract({
        address: token.address,
        abi,
        client: publicClient,
      });
    } else {
      return undefined;
    }
  };

  const tokenContracts = Object.keys(config.tokens).reduce((prev, curr: string) => {
    return {
      ...prev,
      [curr]: getTokenContract(curr as keyof tokenList, TokenAbi),
    };
  }, {}) as {
    [name in keyof tokenList]: TokenContractReturnType;
  };

  const marketContracts = Object.keys(config.contracts.core?.markets || {}).reduce((prev, curr) => {
    const market = config.contracts.core?.markets?.[curr as keyof marketList] as {
      marketToken: keyof tokenList;
      underlyingToken: keyof tokenList;
    };
    return {
      ...prev,
      [curr]: getTokenContract(market.marketToken as keyof tokenList, MarketTokenAbi),
    };
  }, {}) as {
    [name in keyof marketList]: MarketTokenContractReturnType;
  };

  const vaultsContracts = Object.keys(config.contracts.morpho?.vaults || {}).reduce((prev, curr: string) => {
    return {
      ...prev,
      [curr]: getTokenContract(curr as keyof tokenList, MorphoVaultAbi),
    };
  }, {}) as {
    [name in keyof vaultList]: MorphoVaultContractReturnType;
  };

  const environment = {
    name: config.name,
    apis: config.apis,
    network: config.network,
    tokens: config.tokens,
    contracts: {
      tokens: tokenContracts,
      governanceToken: getTokenContract(config.contracts.governanceToken, GovernanceTokenAbi),
      stakingToken: getTokenContract(config.contracts.stakingToken, StakingTokenAbi),
      wrappedNativeToken: getTokenContract(config.contracts.wrappedNativeToken, WrappedNativeTokenAbi),
      core: config.contracts.core
        ? {
            comptroller: getContract(config.contracts.core.comptroller, ComptrollerTokenAbi),
            views: getContract(config.contracts.core.views, CoreViewsAbi),
            markets: marketContracts || {},
            multiRewardDistributor: getContractOrUndefined(config.contracts.core.multiRewardDistributor, MultiRewardDistributorAbi),
            oracle: getContractOrUndefined(config.contracts.core.oracle, ChainLinkOracleAbi),
            router: getContractOrUndefined(config.contracts.core.router, CoreRouterAbi),
            temporalGovernor: getContractOrUndefined(config.contracts.core.temporalGovernor, TemporalGovernorAbi),
            voteCollector: getContractOrUndefined(config.contracts.core.voteCollector, VoteCollectorAbi),
            governor: getContractOrUndefined(config.contracts.core.governor, GovernorAbi),
            multichainGovernor: getContractOrUndefined(config.contracts.core.multichainGovernor, MultichainGovernorAbi),
          }
        : undefined,
      morpho: config.contracts.morpho
        ? {
            blue: getContract(config.contracts.morpho.blue, MorphoBlueAbi),
            bundler: getContract(config.contracts.morpho.bundler, MorphoBundlerAbi),
            publicAllocator: getContract(config.contracts.morpho.publicAllocator, MorphoPublicAllocatorAbi),
            views: getContract(config.contracts.morpho.views, MorphoViewsAbi),
            vaults: vaultsContracts,
          }
        : undefined,
    },
    settings: config.settings,
    config,
    client: publicClient,
  };

  return environment as Prettify<typeof environment>;
};
