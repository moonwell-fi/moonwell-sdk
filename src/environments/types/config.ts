import {
  type Abi,
  type Address,
  type Chain,
  type ChainContract,
  type Hex,
  type Narrow,
  type Prettify,
  type Transport,
  createPublicClient,
  custom,
  getContract,
} from "viem";
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
  MorphoViewsAbi,
  MultiRewardDistributorAbi,
  MultichainGovernorAbi,
  StakingTokenAbi,
  TemporalGovernorAbi,
  TokenAbi,
  VoteCollectorAbi,
  WrappedNativeTokenAbi,
} from "../abis/index.js";
import type { GovernanceToken } from "../definitions/governance.js";
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

export type GetContractConfig<tokens, contract> = contract extends {}
  ? contract
  : keyof tokens;

export type TokensConfig<tokens> = {} extends tokens
  ? {}
  : { [tokenName in keyof tokens]: TokenConfig };
export type VaultsConfig<vaults, tokens> = {} extends vaults
  ? {}
  : { [name in keyof tokens]?: VaultConfig<tokens> };
export type MarketsConfig<markets, tokens> = {} extends markets
  ? {}
  : { [name in keyof tokens]?: MarketConfig<tokens> };
export type MorphoMarketsConfig<markets, tokens> = {} extends markets
  ? {}
  : { [name in keyof markets]: MorphoMarketConfig<tokens> };
export type ContractsConfig<contracts, tokens> = {} extends contracts
  ? {}
  : { [name in keyof ContractConfig<tokens>]?: ContractConfig<tokens>[name] };
export type CustomConfig<custom> = {} extends custom
  ? {}
  : { [name in keyof CustomConfigType]?: CustomConfigType[name] };

export const createTokenConfig = <const tokens>(
  tokens: TokensConfig<Narrow<tokens>>,
) => tokens as Prettify<tokens>;

export const createVaultConfig = <const tokens, const vaults>(config: {
  tokens: TokensConfig<tokens>;
  vaults: VaultsConfig<vaults, tokens>;
}) => config.vaults as Prettify<vaults>;

export const createMarketConfig = <const tokens, const markets>(config: {
  tokens: TokensConfig<tokens>;
  markets: MarketsConfig<markets, tokens>;
}) => config.markets as Prettify<markets>;

export const createMorphoMarketConfig = <const tokens, const markets>(config: {
  tokens: TokensConfig<tokens>;
  markets: MorphoMarketsConfig<markets, tokens>;
}) => config.markets as Prettify<markets>;

export const createContractsConfig = <const tokens, const contracts>(config: {
  tokens: TokensConfig<tokens>;
  contracts: ContractsConfig<contracts, tokens>;
}) => {
  return config.contracts as Prettify<contracts>;
};

export const createCustomConfig = <custom>(custom: CustomConfig<custom>) => {
  return custom as Prettify<custom>;
};

export const createEnvironmentConfig = <
  tokens,
  markets,
  vaults,
  morphoMarkets,
  contracts,
  custom,
>(config: {
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
}) => {
  const publicClient = createPublicClient({
    chain: config.chain,
    batch: {
      multicall: {
        wait: 100,
      },
    },
    cacheTime: 5_000,
    transport: config.transport,
  });

  const createContract = <const abi extends Abi>(
    address: Address,
    abi: abi,
  ) => {
    return getContract({
      address,
      abi,
      client: publicClient,
    });
  };

  const getTokenContract = <const abi extends Abi>(
    key: keyof tokens | undefined,
    abi: abi,
  ) => {
    if (key) {
      const token = config.tokens[key] as TokenConfig;
      return getContract({
        address: token.address,
        abi,
        client: publicClient,
      });
    } else {
      return undefined;
    }
  };

  const tokenContracts = Object.keys(config.tokens).reduce(
    (prev, curr: string) => {
      return {
        ...prev,
        [curr]: getTokenContract(curr as keyof tokens, TokenAbi),
      };
    },
    {},
  ) as {
    [name in keyof tokens]: TokenContractReturnType;
  };

  const marketContracts = Object.keys(config.markets).reduce((prev, curr) => {
    const market = (config.markets as any)[curr] as MarketConfig<tokens>;
    return {
      ...prev,
      [curr]: getTokenContract(market.marketToken, MarketTokenAbi),
    };
  }, {}) as {
    [name in keyof markets]: MarketTokenContractReturnType;
  };

  const vaultsContracts = Object.keys(config.vaults || {}).reduce(
    (prev, curr: string) => {
      return {
        ...prev,
        [curr]: getTokenContract(curr as keyof tokens, TokenAbi),
      };
    },
    {},
  ) as {
    [name in keyof vaults]: MorphoVaultContractReturnType;
  };

  const contracts = Object.keys(config.contracts).reduce((prev, curr) => {
    const key = curr as keyof ContractConfig<any>;
    const item = (config.contracts as any)[key] as Address;
    let abi: Abi = TokenAbi;
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
  }, {}) as Prettify<
    {
      [name in keyof contracts as Extract<
        name,
        "stakingToken"
      >]: StakingTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "wrappedNativeToken"
      >]: WrappedNativeTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "governanceToken"
      >]: GovernanceTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "comptroller"
      >]: ComptrollerContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "views"
      >]: CoreViewsContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoViews"
      >]: MorphoViewsContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "multiRewardDistributor"
      >]: MultiRewardDistributorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "temporalGovernor"
      >]: TemporalGovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "voteCollector"
      >]: VoteCollectorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "governor"
      >]: GovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "multichainGovernor"
      >]: MultichainGovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "oracle"
      >]: ChainLinkOracleContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "router"
      >]: CoreRouterContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoBlue"
      >]: MorphoBlueContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoBundler"
      >]: MorphoBundlerContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoPublicAllocator"
      >]: MorphoPublicAllocatorContractReturnType;
    }
  >;

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
      tokens: config.tokens as {
        [name in keyof tokens]: TokenConfig;
      },
      contracts: config.contracts,
    },
  } as Environment<tokens, markets, vaults, contracts, custom>;
};

export type Environment<
  tokens = any,
  markets = any,
  vaults = any,
  contracts = Partial<ContractsConfigReturnType>,
  custom = CustomConfigType,
> = {
  name: string;
  chainId: number;
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
  contracts: Prettify<
    {
      [name in keyof contracts as Extract<
        name,
        "stakingToken"
      >]: StakingTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "wrappedNativeToken"
      >]: WrappedNativeTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "governanceToken"
      >]: GovernanceTokenContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "comptroller"
      >]: ComptrollerContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "views"
      >]: CoreViewsContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoViews"
      >]: MorphoViewsContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "multiRewardDistributor"
      >]: MultiRewardDistributorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "temporalGovernor"
      >]: TemporalGovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "voteCollector"
      >]: VoteCollectorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "governor"
      >]: GovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "multichainGovernor"
      >]: MultichainGovernorContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "oracle"
      >]: ChainLinkOracleContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "router"
      >]: CoreRouterContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoBlue"
      >]: MorphoBlueContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoBundler"
      >]: MorphoBundlerContractReturnType;
    } & {
      [name in keyof contracts as Extract<
        name,
        "morphoPublicAllocator"
      >]: MorphoPublicAllocatorContractReturnType;
    }
  >;
  custom: custom;
  config: {
    tokens: {
      [name in keyof tokens]: TokenConfig;
    };
    markets: {
      [name in keyof markets]: MarketConfig<tokens>;
    };
    vaults: {
      [name in keyof vaults]: VaultConfig<tokens>;
    };
    morphoMarkets: {
      [id: string]: MorphoMarketConfig<tokens>;
    };
    contracts: ContractConfig<tokens>;
  };
};
