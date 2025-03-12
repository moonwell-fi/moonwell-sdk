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
  type morphoMarkets as optimismMorphoMarkets,
  type tokens as optimismTokens,
  type vaults as optimismVaults,
} from "./definitions/optimism/environment.js";

import {
  createEnvironment as createEthereumEnvironment,
  ethereum,
  type tokens as ethereumTokens,
} from "./definitions/ethereum/environment.js";

import {
  avalanche,
  type tokens as avalancheTokens,
  createEnvironment as createAvalancheEnvironment,
} from "./definitions/avalanche/environment.js";

import {
  arbitrum,
  type tokens as arbitrumTokens,
  createEnvironment as createArbitrumEnvironment,
} from "./definitions/arbitrum/environment.js";

import {
  createEnvironment as createPolygonEnvironment,
  polygon,
  type tokens as polygonTokens,
} from "./definitions/polygon/environment.js";

import { moonbeam, moonriver, optimism } from "viem/chains";
import type { Environment, TokenConfig } from "./types/config.js";

export {
  arbitrum,
  avalanche,
  base,
  ethereum,
  GovernanceTokensConfig,
  moonbeam,
  moonriver,
  optimism,
  polygon,
  supportedChains,
  supportedChainsIds,
};
export type {
  Chain,
  Environment,
  GovernanceToken,
  GovernanceTokenInfo,
  GovernanceTokensType,
  Prettify,
  SupportedChains,
  SupportedChainsIds,
  TokenConfig,
  Transport,
};

const supportedChainsIds: { [id: number]: keyof typeof supportedChains } = {
  [base.id]: "base",
  [optimism.id]: "optimism",
  [moonriver.id]: "moonriver",
  [moonbeam.id]: "moonbeam",
  [ethereum.id]: "ethereum",
  [avalanche.id]: "avalanche",
  [arbitrum.id]: "arbitrum",
  [polygon.id]: "polygon",
};

const supportedChains = {
  base: base,
  optimism: optimism,
  moonriver: moonriver,
  moonbeam: moonbeam,
  ethereum: ethereum,
  avalanche: avalanche,
  arbitrum: arbitrum,
  polygon: polygon,
};

type SupportedChains = Prettify<keyof typeof supportedChains>;
type SupportedChainsIds = Prettify<keyof typeof supportedChainsIds>;

export type BaseEnvironment = ReturnType<typeof createBaseEnvironment>;
export type MoonbeamEnvironment = ReturnType<typeof createMoonbeamEnvironment>;
export type MoonriverEnvironment = ReturnType<
  typeof createMoonriverEnvironment
>;
export type OptimismEnvironment = ReturnType<typeof createOptimismEnvironment>;
export type EthereumEnvironment = ReturnType<typeof createEthereumEnvironment>;
export type AvalancheEnvironment = ReturnType<
  typeof createAvalancheEnvironment
>;
export type ArbitrumEnvironment = ReturnType<typeof createArbitrumEnvironment>;
export type PolygonEnvironment = ReturnType<typeof createPolygonEnvironment>;

export type GetEnvironment<chain> = chain extends typeof base
  ? BaseEnvironment
  : chain extends typeof moonbeam
    ? MoonbeamEnvironment
    : chain extends typeof moonriver
      ? MoonriverEnvironment
      : chain extends typeof optimism
        ? OptimismEnvironment
        : chain extends typeof ethereum
          ? EthereumEnvironment
          : chain extends typeof avalanche
            ? AvalancheEnvironment
            : chain extends typeof arbitrum
              ? ArbitrumEnvironment
              : chain extends typeof polygon
                ? PolygonEnvironment
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
    case ethereum.id:
      return createEthereumEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case avalanche.id:
      return createAvalancheEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case arbitrum.id:
      return createArbitrumEnvironment(
        config.rpcUrls,
        config.indexerUrl,
      ) as GetEnvironment<chain>;
    case polygon.id:
      return createPolygonEnvironment(
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
  ethereum: createEthereumEnvironment(),
  avalanche: createAvalancheEnvironment(),
  arbitrum: createArbitrumEnvironment(),
  polygon: createPolygonEnvironment(),
};

export type TokensType<environment> = environment extends BaseEnvironment
  ? typeof baseTokens
  : environment extends MoonbeamEnvironment
    ? typeof moonbeamTokens
    : environment extends MoonriverEnvironment
      ? typeof moonriverTokens
      : environment extends OptimismEnvironment
        ? typeof optimismTokens
        : environment extends EthereumEnvironment
          ? typeof ethereumTokens
          : environment extends AvalancheEnvironment
            ? typeof avalancheTokens
            : environment extends ArbitrumEnvironment
              ? typeof arbitrumTokens
              : environment extends PolygonEnvironment
                ? typeof polygonTokens
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
  : environment extends OptimismEnvironment
    ? typeof optimismVaults
    : undefined;

export type MorphoMarketsType<environment> = environment extends BaseEnvironment
  ? typeof baseMorphoMarkets
  : environment extends OptimismEnvironment
    ? typeof optimismMorphoMarkets
    : undefined;
