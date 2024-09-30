import type { Chain, Prettify, Transport } from "viem";
import {
  type GovernanceToken,
  type GovernanceTokenInfo,
  GovernanceTokensConfig,
  type GovernanceTokensType,
} from "./definitions/governance.js";

import {
  base,
  type markets as baseMarkets,
  type morphoMarkets as baseMorphoMarkets,
  type tokens as baseTokens,
  type vaults as baseVaults,
  createEnvironment as createBaseEnvironment,
} from "./definitions/base/environment.js";

import {
  createEnvironment as createMoonbeamEnvironment,
  type markets as moonbeamMarkets,
  type tokens as moonbeamTokens,
} from "./definitions/moonbeam/environment.js";

import {
  createEnvironment as createMoonriverEnvironment,
  type markets as moonriverMarkets,
  type tokens as moonriverTokens,
} from "./definitions/moonriver/environment.js";

import {
  createEnvironment as createOptimismEnvironment,
  type markets as optimismMarkets,
  type tokens as optimismTokens,
} from "./definitions/optimism/environment.js";

import { moonbeam, moonriver, optimism } from "viem/chains";
import type { Environment, TokenConfig } from "./types/config.js";

export type {
  GovernanceToken,
  GovernanceTokenInfo,
  GovernanceTokensType,
  Environment,
  BaseEnvironment,
  MoonbeamEnvironment,
  MoonriverEnvironment,
  OptimismEnvironment,
  Chain,
  Prettify,
  Transport,
  SupportedChains,
  TokenConfig,
};
export {
  base,
  GovernanceTokensConfig,
  moonbeam,
  moonriver,
  optimism,
  supportedChains,
};

const supportedChains = { base, optimism, moonriver, moonbeam };
type SupportedChains = Prettify<keyof typeof supportedChains>;

type BaseEnvironment = ReturnType<typeof createBaseEnvironment>;
type MoonbeamEnvironment = ReturnType<typeof createMoonbeamEnvironment>;
type MoonriverEnvironment = ReturnType<typeof createMoonriverEnvironment>;
type OptimismEnvironment = ReturnType<typeof createOptimismEnvironment>;

export type GetEnvironment<chain> = chain extends typeof base
  ? BaseEnvironment
  : chain extends typeof moonbeam
    ? MoonbeamEnvironment
    : chain extends typeof moonriver
      ? MoonriverEnvironment
      : chain extends typeof optimism
        ? OptimismEnvironment
        : undefined;

export const createEnvironment = <const chain extends Chain>(config: {
  chain: chain;
  rpcUrls?: string[];
  indexerUrl?: string;
}): GetEnvironment<chain> => {
  switch (config.chain.id) {
    case base.id:
      return createBaseEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case moonbeam.id:
      return createMoonbeamEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case moonriver.id:
      return createMoonriverEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case optimism.id:
      return createOptimismEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    default:
      throw new Error("Unsupported chainId");
  }
};

export const publicEnvironments = {
  base: createEnvironment({ chain: base }),
  moonbeam: createEnvironment({ chain: moonbeam }),
  moonriver: createEnvironment({ chain: moonriver }),
  optimism: createEnvironment({ chain: optimism }),
} as unknown as { [name in keyof typeof supportedChains]: Environment };

export type TokensType<chain> = chain extends typeof base
  ? typeof baseTokens
  : chain extends typeof moonbeam
    ? typeof moonbeamTokens
    : chain extends typeof moonriver
      ? typeof moonriverTokens
      : chain extends typeof optimism
        ? typeof optimismTokens
        : undefined;

export type MarketsType<chain> = chain extends typeof base
  ? typeof baseMarkets
  : chain extends typeof moonbeam
    ? typeof moonbeamMarkets
    : chain extends typeof moonriver
      ? typeof moonriverMarkets
      : chain extends typeof optimism
        ? typeof optimismMarkets
        : undefined;

export type VaultsType<chain> = chain extends typeof base
  ? typeof baseVaults
  : undefined;

export type MorphoMarketsType<chain> = chain extends typeof base
  ? typeof baseMorphoMarkets
  : undefined;
