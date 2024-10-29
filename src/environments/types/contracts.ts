import type { Address, GetContractReturnType, PublicClient } from "viem";
import type {
  ChainLinkOracleAbi,
  ComptrollerTokenAbi,
  CoreRouterAbi,
  CoreViewsAbi,
  GovernanceTokenAbi,
  GovernorAbi,
  MarketTokenAbi,
  MaximillionAbi,
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
  TokenSaleAbi,
  VoteCollectorAbi,
  WrappedNativeTokenAbi,
} from "../abis/index.js";

export type TokenContractReturnType = GetContractReturnType<
  typeof TokenAbi,
  PublicClient,
  Address
>;

export type MarketTokenContractReturnType = GetContractReturnType<
  typeof MarketTokenAbi,
  PublicClient,
  Address
>;

export type GovernanceTokenContractReturnType = GetContractReturnType<
  typeof GovernanceTokenAbi,
  PublicClient,
  Address
>;

export type WrappedNativeTokenContractReturnType = GetContractReturnType<
  typeof WrappedNativeTokenAbi,
  PublicClient,
  Address
>;

export type StakingTokenContractReturnType = GetContractReturnType<
  typeof StakingTokenAbi,
  PublicClient,
  Address
>;

export type ComptrollerContractReturnType = GetContractReturnType<
  typeof ComptrollerTokenAbi,
  PublicClient,
  Address
>;

export type MaximillionContractReturnType = GetContractReturnType<
  typeof MaximillionAbi,
  PublicClient,
  Address
>;

export type MultiRewardDistributorContractReturnType = GetContractReturnType<
  typeof MultiRewardDistributorAbi,
  PublicClient,
  Address
>;

export type CoreViewsContractReturnType = GetContractReturnType<
  typeof CoreViewsAbi,
  PublicClient,
  Address
>;

export type TokenSaleContractReturnType = GetContractReturnType<
  typeof TokenSaleAbi,
  PublicClient,
  Address
>;
export type TemporalGovernorContractReturnType = GetContractReturnType<
  typeof TemporalGovernorAbi,
  PublicClient,
  Address
>;

export type VoteCollectorContractReturnType = GetContractReturnType<
  typeof VoteCollectorAbi,
  PublicClient,
  Address
>;

export type ChainLinkOracleContractReturnType = GetContractReturnType<
  typeof ChainLinkOracleAbi,
  PublicClient,
  Address
>;

export type CoreRouterContractReturnType = GetContractReturnType<
  typeof CoreRouterAbi,
  PublicClient,
  Address
>;

export type MorphoBlueContractReturnType = GetContractReturnType<
  typeof MorphoBlueAbi,
  PublicClient,
  Address
>;

export type MorphoBundlerContractReturnType = GetContractReturnType<
  typeof MorphoBundlerAbi,
  PublicClient,
  Address
>;

export type MorphoViewsContractReturnType = GetContractReturnType<
  typeof MorphoViewsAbi,
  PublicClient,
  Address
>;

export type MorphoPublicAllocatorContractReturnType = GetContractReturnType<
  typeof MorphoPublicAllocatorAbi,
  PublicClient,
  Address
>;

export type MorphoVaultContractReturnType = GetContractReturnType<
  typeof MorphoVaultAbi,
  PublicClient,
  Address
>;

export type GovernorContractReturnType = GetContractReturnType<
  typeof GovernorAbi,
  PublicClient,
  Address
>;

export type MultichainGovernorContractReturnType = GetContractReturnType<
  typeof MultichainGovernorAbi,
  PublicClient,
  Address
>;
