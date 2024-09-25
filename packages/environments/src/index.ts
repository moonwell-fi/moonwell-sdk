import { baseChain } from "./definitions/base/chain.js";
import { base, type baseMarketsList, type baseMorphoMarketsList } from "./definitions/base/environment.js";
import type { baseVaultList } from "./definitions/base/morpho-vaults.js";
import type { baseTokenList } from "./definitions/base/tokens.js";
import {
  type GovernanceToken,
  type GovernanceTokenInfo,
  GovernanceTokensConfig,
  type GovernanceTokensType,
} from "./definitions/governance.js";
import { moonbeamChain } from "./definitions/moonbeam/chain.js";
import type { moonbeamMarketsList } from "./definitions/moonbeam/core-markets.js";
import { moonbeam } from "./definitions/moonbeam/environment.js";
import type { moonbeamTokenList } from "./definitions/moonbeam/tokens.js";
import { moonriverChain } from "./definitions/moonriver/chain.js";
import { moonriver, type moonriverMarketsList } from "./definitions/moonriver/environment.js";
import type { moonriverTokenList } from "./definitions/moonriver/tokens.js";
import { optimismChain } from "./definitions/optimism/chain.js";
import { optimism, type optimismMarketsList } from "./definitions/optimism/environment.js";
import type { optimismTokenList } from "./definitions/optimism/tokens.js";
import { type Environment, type TokenConfig, createEnvironmentList } from "./types/environment.js";

export {
  base,
  moonbeam,
  moonriver,
  optimism,
  baseChain,
  moonbeamChain,
  moonriverChain,
  optimismChain,
  GovernanceTokensConfig,
  type Environment,
  type TokenConfig,
  type GovernanceToken,
  type GovernanceTokenInfo,
  type GovernanceTokensType,
};

const environmentList = createEnvironmentList({
  base,
  moonbeam,
  moonriver,
  optimism,
});

export const environments = Object.values(environmentList) as Environment[];

export type EnvironmentsType<T> = {
  [name in keyof typeof environmentList]?: T;
};

export type EnvironmentTokensListType<T> = T extends typeof base
  ? typeof baseTokenList
  : T extends typeof moonbeam
    ? typeof moonbeamTokenList
    : T extends typeof moonriver
      ? typeof moonriverTokenList
      : T extends typeof optimism
        ? typeof optimismTokenList
        : undefined;

export type EnvironmentVaultsListType<T> = T extends typeof base ? typeof baseVaultList : undefined;
export type EnvironmentMorphoMarketsListType<T> = T extends typeof base ? typeof baseMorphoMarketsList : undefined;
export type EnvironmentMarketsListType<T> = T extends typeof base
  ? typeof baseMarketsList
  : T extends typeof moonbeam
    ? typeof moonbeamMarketsList
    : T extends typeof moonriver
      ? typeof moonriverMarketsList
      : T extends typeof optimism
        ? typeof optimismMarketsList
        : undefined;
