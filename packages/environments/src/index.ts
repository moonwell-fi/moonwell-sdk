import type { Prettify } from "viem";
import { type baseMarketsList, type baseMorphoMarketsList, createBaseEnvironment } from "./definitions/base/environment.js";
import type { baseVaultList } from "./definitions/base/morpho-vaults.js";
import { base } from "./definitions/base/network.js";
import type { baseTokenList } from "./definitions/base/tokens.js";
import {
  type GovernanceToken,
  type GovernanceTokenInfo,
  GovernanceTokensConfig,
  type GovernanceTokensType,
} from "./definitions/governance.js";
import type { moonbeamMarketsList } from "./definitions/moonbeam/core-markets.js";
import { createMoonbeamEnvironment } from "./definitions/moonbeam/environment.js";
import { moonbeam } from "./definitions/moonbeam/network.js";
import type { moonbeamTokenList } from "./definitions/moonbeam/tokens.js";
import { createMoonriverEnvironment, type moonriverMarketsList } from "./definitions/moonriver/environment.js";
import { moonriver } from "./definitions/moonriver/network.js";
import type { moonriverTokenList } from "./definitions/moonriver/tokens.js";
import { createOptimismEnvironment, optimism, type optimismMarketsList } from "./definitions/optimism/environment.js";
import type { optimismTokenList } from "./definitions/optimism/tokens.js";
import type { Environment, TokenConfig } from "./types/environment.js";
import type { Network } from "./types/network.js";

export type { Network, TokenConfig, Environment, GovernanceToken, GovernanceTokenInfo, GovernanceTokensType };
export { base, moonbeam, moonriver, optimism, GovernanceTokensConfig };

const supportedChains = {
  base,
  moonbeam,
  moonriver,
  optimism,
};

type BaseEnvironmentType = ReturnType<typeof createBaseEnvironment>;
type MoonbeamEnvironmentType = ReturnType<typeof createMoonbeamEnvironment>;
type MoonriverEnvironmentType = ReturnType<typeof createMoonriverEnvironment>;
type OptimismEnvironmentType = ReturnType<typeof createOptimismEnvironment>;

export type ChainConfig = {
  rpcUrls?: string[];
};

export type GetEnvironment<chain> = chain extends typeof base
  ? BaseEnvironmentType
  : chain extends typeof moonbeam
    ? MoonbeamEnvironmentType
    : chain extends typeof moonriver
      ? MoonriverEnvironmentType
      : chain extends typeof optimism
        ? OptimismEnvironmentType
        : undefined;

export type CreateEnvironmentsReturnType<chains> = {
  [name in keyof chains]: GetEnvironment<chains[name]>;
};

export const createEnvironment = <networkType>(network: Network, rpcUrls?: string[]) => {
  const result =
    network.chain.id === base.chain.id
      ? createBaseEnvironment(rpcUrls ?? [])
      : network.chain.id === moonbeam.chain.id
        ? createMoonbeamEnvironment(rpcUrls ?? [])
        : network.chain.id === moonriver.chain.id
          ? createMoonriverEnvironment(rpcUrls ?? [])
          : network.chain.id === optimism.chain.id
            ? createOptimismEnvironment(rpcUrls ?? [])
            : undefined;
  return result as GetEnvironment<networkType>;
};

export const createEnvironments = <const chains>(config: { [name in keyof chains]: ChainConfig }) => {
  const result = Object.keys(config).reduce(
    (prev, curr: string) => {
      const item = config[curr as keyof chains] as ChainConfig;
      const chain = supportedChains[curr as keyof typeof supportedChains];
      return {
        ...prev,
        curr: createEnvironment(chain, item.rpcUrls),
      };
    },
    {} as { [name in keyof chains]?: unknown },
  );
  return result as Prettify<CreateEnvironmentsReturnType<chains>>;
};

export const publicEnvironments = createEnvironments<typeof supportedChains>({
  base: {},
  moonbeam: {},
  moonriver: {},
  optimism: {},
}) as { [name in keyof typeof supportedChains]: Environment };

export type TokensType<T> = T extends BaseEnvironmentType
  ? typeof baseTokenList
  : T extends MoonbeamEnvironmentType
    ? typeof moonbeamTokenList
    : T extends MoonriverEnvironmentType
      ? typeof moonriverTokenList
      : T extends OptimismEnvironmentType
        ? typeof optimismTokenList
        : undefined;

export type MarketsType<T> = T extends BaseEnvironmentType
  ? typeof baseMarketsList
  : T extends MoonbeamEnvironmentType
    ? typeof moonbeamMarketsList
    : T extends MoonriverEnvironmentType
      ? typeof moonriverMarketsList
      : T extends OptimismEnvironmentType
        ? typeof optimismMarketsList
        : undefined;

export type VaultsType<T> = T extends BaseEnvironmentType ? typeof baseVaultList : undefined;

export type MorphoMarketsType<T> = T extends BaseEnvironmentType ? typeof baseMorphoMarketsList : undefined;
