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
  Chain,
  Prettify,
  Transport,
  SupportedChains,
  SupportedChainsIds,
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

const supportedChains = {
  base,
  optimism,
  moonriver,
  moonbeam,
};

const supportedChainsIds = {
  [base.id]: base,
  [optimism.id]: optimism,
  [moonriver.id]: moonriver,
  [moonbeam.id]: moonbeam,
};

type SupportedChains = Prettify<keyof typeof supportedChains>;
type SupportedChainsIds = Prettify<keyof typeof supportedChainsIds>;

export type BaseEnvironment = ReturnType<typeof createBaseEnvironment>;
export type MoonbeamEnvironment = ReturnType<typeof createMoonbeamEnvironment>;
export type MoonriverEnvironment = ReturnType<
  typeof createMoonriverEnvironment
>;
export type OptimismEnvironment = ReturnType<typeof createOptimismEnvironment>;

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
  rpcUrls?: string[] | undefined;
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
  base: createBaseEnvironment(),
  moonbeam: createMoonbeamEnvironment(),
  moonriver: createMoonriverEnvironment(),
  optimism: createOptimismEnvironment(),
};

export type TokensType<environment> = environment extends BaseEnvironment
  ? typeof baseTokens
  : environment extends MoonbeamEnvironment
    ? typeof moonbeamTokens
    : environment extends MoonriverEnvironment
      ? typeof moonriverTokens
      : environment extends OptimismEnvironment
        ? typeof optimismTokens
        : undefined;

export type MarketsType<environment> = environment extends BaseEnvironment
  ? typeof baseMarkets
  : environment extends MoonbeamEnvironment
    ? typeof moonbeamMarkets
    : environment extends MoonriverEnvironment
      ? typeof moonriverMarkets
      : environment extends OptimismEnvironment
        ? typeof optimismMarkets
        : undefined;

export type VaultsType<environment> = environment extends BaseEnvironment
  ? typeof baseVaults
  : undefined;

export type MorphoMarketsType<environment> = environment extends BaseEnvironment
  ? typeof baseMorphoMarkets
  : undefined;
