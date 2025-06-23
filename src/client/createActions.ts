import type { Chain } from "viem";
import {
  type GetBeamTokenRoutesReturnType,
  getBeamTokenRoutes,
} from "../actions/beam/getBeamTokenRoutes.js";

import {
  type GetBeamQuoteParameters,
  type GetBeamQuoteReturnType,
  getBeamQuote,
} from "../actions/beam/getBeamQuote.js";

import {
  type GetMarketParameters,
  type GetMarketReturnType,
  getMarket,
} from "../actions/core/markets/getMarket.js";
import {
  type GetMarketsParameters,
  type GetMarketsReturnType,
  getMarkets,
} from "../actions/core/markets/getMarkets.js";
import type { MoonwellClient } from "./createMoonwellClient.js";

import {
  type GetBeamTokenLimitsArgs,
  type GetBeamTokenLimitsReturnType,
  getBeamTokenLimits,
} from "../actions/beam/getBeamTokenLimits.js";
import {
  type GetUserBalancesParameters,
  type GetUserBalancesReturnType,
  getUserBalances,
} from "../actions/core/getUserBalances.js";
import {
  type GetUserPositionParameters,
  type GetUserPositionReturnType,
  getUserPosition,
} from "../actions/core/user-positions/getUserPosition.js";
import {
  type GetUserPositionSnapshotsParameters,
  type GetUserPositionSnapshotsReturnType,
  getUserPositionSnapshots,
} from "../actions/core/user-positions/getUserPositionSnapshots.js";
import {
  type GetUserPositionsParameters,
  type GetUserPositionsReturnType,
  getUserPositions,
} from "../actions/core/user-positions/getUserPositions.js";
import {
  type GetUserRewardParameters,
  type GetUserRewardReturnType,
  getUserReward,
} from "../actions/core/user-rewards/getUserReward.js";
import {
  type GetUserRewardsParameters,
  type GetUserRewardsReturnType,
  getUserRewards,
} from "../actions/core/user-rewards/getUserRewards.js";
import {
  type GetCirculatingSupplySnapshotsParameters,
  type GetCirculatingSupplySnapshotsReturnType,
  getCirculatingSupplySnapshots,
} from "../actions/governance/getCirculatingSupplySnapshots.js";
import {
  type GetDelegatesReturnType,
  getDelegates,
} from "../actions/governance/getDelegates.js";
import {
  type GetDiscussionsReturnType,
  getDiscussions,
} from "../actions/governance/getDiscussions.js";
import {
  type GetGovernanceTokenInfoParameters,
  type GetGovernanceTokenInfoReturnType,
  getGovernanceTokenInfo,
} from "../actions/governance/getGovernanceTokenInfo.js";
import {
  type GetStakingInfoParameters,
  type GetStakingInfoReturnType,
  getStakingInfo,
} from "../actions/governance/getStakingInfo.js";
import {
  type GetStakingSnapshotsParameters,
  type GetStakingSnapshotsReturnType,
  getStakingSnapshots,
} from "../actions/governance/getStakingSnapshots.js";
import {
  type GetUserStakingInfoParameters,
  type GetUserStakingInfoReturnType,
  getUserStakingInfo,
} from "../actions/governance/getUserStakingInfo.js";
import {
  type GetUserVoteReceiptParameters,
  type GetUserVoteReceiptReturnType,
  getUserVoteReceipt,
} from "../actions/governance/getUserVoteReceipt.js";
import {
  type GetUserVotingPowersParameters,
  type GetUserVotingPowersReturnType,
  getUserVotingPowers,
} from "../actions/governance/getUserVotingPowers.js";
import {
  type GetProposalParameters,
  type GetProposalReturnType,
  getProposal,
} from "../actions/governance/proposals/getProposal.js";
import {
  type GetProposalsParameters,
  type GetProposalsReturnType,
  getProposals,
} from "../actions/governance/proposals/getProposals.js";
import {
  type GetSnapshotProposalParameters,
  type GetSnapshotProposalReturnType,
  getSnapshotProposal,
} from "../actions/governance/snapshot/getSnapshotProposal.js";
import {
  type GetSnapshotProposalsParameters,
  type GetSnapshotProposalsReturnType,
  getSnapshotProposals,
} from "../actions/governance/snapshot/getSnapshotProposals.js";
import {
  type GetMarketSnapshotsParameters,
  type GetMarketSnapshotsReturnType,
  type GetMorphoVaultUserPositionSnapshotsParameters,
  type GetMorphoVaultUserPositionSnapshotsReturnType,
  getMarketSnapshots,
  getMorphoVaultUserPositionSnapshots,
} from "../actions/index.js";
import {
  type GetMorphoUserBalancesParameters,
  type GetMorphoUserBalancesReturnType,
  getMorphoUserBalances,
} from "../actions/morpho/getMorphoUserBalances.js";
import {
  type GetMorphoMarketParameters,
  type GetMorphoMarketReturnType,
  getMorphoMarket,
} from "../actions/morpho/markets/getMorphoMarket.js";
import {
  type GetMorphoMarketsParameters,
  type GetMorphoMarketsReturnType,
  getMorphoMarkets,
} from "../actions/morpho/markets/getMorphoMarkets.js";
import {
  type GetMorphoMarketUserPositionParameters,
  type GetMorphoMarketUserPositionReturnType,
  getMorphoMarketUserPosition,
} from "../actions/morpho/user-positions/getMorphoMarketUserPosition.js";
import {
  type GetMorphoMarketUserPositionsParameters,
  type GetMorphoMarketUserPositionsReturnType,
  getMorphoMarketUserPositions,
} from "../actions/morpho/user-positions/getMorphoMarketUserPositions.js";
import {
  type GetMorphoVaultUserPositionParameters,
  type GetMorphoVaultUserPositionReturnType,
  getMorphoVaultUserPosition,
} from "../actions/morpho/user-positions/getMorphoVaultUserPosition.js";
import {
  type GetMorphoVaultUserPositionsParameters,
  type GetMorphoVaultUserPositionsReturnType,
  getMorphoVaultUserPositions,
} from "../actions/morpho/user-positions/getMorphoVaultUserPositions.js";
import {
  type GetMorphoUserRewardsParameters,
  type GetMorphoUserRewardsReturnType,
  getMorphoUserRewards,
} from "../actions/morpho/user-rewards/getMorphoUserRewards.js";
import {
  type GetMorphoUserStakingRewardsParameters,
  type GetMorphoUserStakingRewardsReturnType,
  getMorphoUserStakingRewards,
} from "../actions/morpho/user-rewards/getMorphoUserStakingRewards.js";
import {
  type GetMorphoVaultParameters,
  type GetMorphoVaultReturnType,
  getMorphoVault,
} from "../actions/morpho/vaults/getMorphoVault.js";
import {
  type GetMorphoVaultSnapshotsParameters,
  type GetMorphoVaultSnapshotsReturnType,
  getMorphoVaultSnapshots,
} from "../actions/morpho/vaults/getMorphoVaultSnapshots.js";
import {
  type GetMorphoVaultStakingSnapshotsParameters,
  type GetMorphoVaultStakingSnapshotsReturnType,
  getMorphoVaultStakingSnapshots,
} from "../actions/morpho/vaults/getMorphoVaultStakingSnapshots.js";
import {
  type GetMorphoVaultsParameters,
  type GetMorphoVaultsReturnType,
  getMorphoVaults,
} from "../actions/morpho/vaults/getMorphoVaults.js";
import type { Environment, SupportedChains } from "../environments/index.js";

export type Actions<
  environments extends { [name in SupportedChains]?: Environment },
> = {
  getBeamQuote: <chain extends Chain | undefined = Chain | undefined>(
    args: GetBeamQuoteParameters<environments, chain>,
  ) => GetBeamQuoteReturnType;

  getBeamTokenRoutes: () => GetBeamTokenRoutesReturnType;

  getBeamTokenLimits: (
    args: GetBeamTokenLimitsArgs,
  ) => GetBeamTokenLimitsReturnType;

  getMarket: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMarketParameters<environments, chain>,
  ) => GetMarketReturnType;

  getMarkets: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetMarketsParameters<environments, chain>,
  ) => GetMarketsReturnType;

  getUserPosition: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserPositionParameters<environments, chain>,
  ) => GetUserPositionReturnType;

  getUserPositions: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserPositionsParameters<environments, chain>,
  ) => GetUserPositionsReturnType;

  getUserReward: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserRewardParameters<environments, chain>,
  ) => GetUserRewardReturnType;

  getUserRewards: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserRewardsParameters<environments, chain>,
  ) => GetUserRewardsReturnType;

  getUserBalances: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserBalancesParameters<environments, chain>,
  ) => GetUserBalancesReturnType;

  getProposal: <chain extends Chain | undefined = Chain | undefined>(
    args: GetProposalParameters<environments, chain>,
  ) => GetProposalReturnType;

  getProposals: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetProposalsParameters<environments, chain>,
  ) => GetProposalsReturnType;

  getSnapshotProposal: <chain extends Chain | undefined = Chain | undefined>(
    args: GetSnapshotProposalParameters<environments, chain>,
  ) => GetSnapshotProposalReturnType;

  getSnapshotProposals: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetSnapshotProposalsParameters<environments, chain>,
  ) => GetSnapshotProposalsReturnType;

  getDelegates: () => GetDelegatesReturnType;

  getDiscussions: () => GetDiscussionsReturnType;

  getGovernanceTokenInfo: (
    args: GetGovernanceTokenInfoParameters,
  ) => GetGovernanceTokenInfoReturnType;

  getStakingInfo: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetStakingInfoParameters<environments, chain>,
  ) => GetStakingInfoReturnType;

  getStakingSnapshots: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetStakingSnapshotsParameters<environments, chain>,
  ) => GetStakingSnapshotsReturnType;

  getUserStakingInfo: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserStakingInfoParameters<environments, chain>,
  ) => GetUserStakingInfoReturnType;

  getUserVoteReceipt: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserVoteReceiptParameters<environments, chain>,
  ) => GetUserVoteReceiptReturnType;

  getUserVotingPowers: <chain extends Chain | undefined = Chain | undefined>(
    args: GetUserVotingPowersParameters<environments, chain>,
  ) => GetUserVotingPowersReturnType;

  getMorphoMarket: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMorphoMarketParameters<environments, chain>,
  ) => GetMorphoMarketReturnType;

  getMorphoMarkets: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetMorphoMarketsParameters<environments, chain>,
  ) => GetMorphoMarketsReturnType;

  getMorphoMarketUserPosition: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoMarketUserPositionParameters<environments, chain>,
  ) => GetMorphoMarketUserPositionReturnType;

  getMorphoMarketUserPositions: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoMarketUserPositionsParameters<environments, chain>,
  ) => GetMorphoMarketUserPositionsReturnType;

  getMorphoVaultUserPosition: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoVaultUserPositionParameters<environments, chain>,
  ) => GetMorphoVaultUserPositionReturnType;

  getMorphoVaultUserPositions: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoVaultUserPositionsParameters<environments, chain>,
  ) => GetMorphoVaultUserPositionsReturnType;

  getMorphoUserRewards: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMorphoUserRewardsParameters<environments, chain>,
  ) => GetMorphoUserRewardsReturnType;

  getMorphoUserStakingRewards: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoUserStakingRewardsParameters<environments, chain>,
  ) => GetMorphoUserStakingRewardsReturnType;

  getMorphoVault: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMorphoVaultParameters<environments, chain>,
  ) => GetMorphoVaultReturnType;

  getMorphoVaults: <chain extends Chain | undefined = Chain | undefined>(
    args?: GetMorphoVaultsParameters<environments, chain>,
  ) => GetMorphoVaultsReturnType;

  getMorphoUserBalances: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMorphoUserBalancesParameters<environments, chain>,
  ) => GetMorphoUserBalancesReturnType;

  getCirculatingSupplySnapshots: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetCirculatingSupplySnapshotsParameters<environments, chain>,
  ) => GetCirculatingSupplySnapshotsReturnType;

  getMarketSnapshots: <chain extends Chain | undefined = Chain | undefined>(
    args: GetMarketSnapshotsParameters<environments, chain>,
  ) => GetMarketSnapshotsReturnType;

  getMorphoVaultSnapshots: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoVaultSnapshotsParameters<environments, chain>,
  ) => GetMorphoVaultSnapshotsReturnType;

  getMorphoVaultStakingSnapshots: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoVaultStakingSnapshotsParameters<environments, chain>,
  ) => GetMorphoVaultStakingSnapshotsReturnType;

  getUserPositionSnapshots: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetUserPositionSnapshotsParameters<environments, chain>,
  ) => GetUserPositionSnapshotsReturnType;

  getMorphoVaultUserPositionSnapshots: <
    chain extends Chain | undefined = Chain | undefined,
  >(
    args: GetMorphoVaultUserPositionSnapshotsParameters<environments, chain>,
  ) => GetMorphoVaultUserPositionSnapshotsReturnType;
};

export const actions = <
  environments extends { [name in SupportedChains]?: Environment },
>(
  client: MoonwellClient<environments>,
): Actions<environments> => {
  return {
    getBeamTokenLimits: (args) => getBeamTokenLimits(args),
    getBeamQuote: (args) => getBeamQuote(client, args),
    getBeamTokenRoutes: () => getBeamTokenRoutes(client),
    getMarket: (args) => getMarket(client, args),
    getMarkets: (args) => getMarkets(client, args),
    getUserPosition: (args) => getUserPosition(client, args),
    getUserPositions: (args) => getUserPositions(client, args),
    getUserReward: (args) => getUserReward(client, args),
    getUserRewards: (args) => getUserRewards(client, args),
    getUserBalances: (args) => getUserBalances(client, args),
    getProposal: (args) => getProposal(client, args),
    getProposals: (args) => getProposals(client, args),
    getSnapshotProposal: (args) => getSnapshotProposal(client, args),
    getSnapshotProposals: (args) => getSnapshotProposals(client, args),
    getDelegates: () => getDelegates(client),
    getDiscussions: () => getDiscussions(client),
    getGovernanceTokenInfo: (args) => getGovernanceTokenInfo(client, args),
    getStakingInfo: (args) => getStakingInfo(client, args),
    getStakingSnapshots: (args) => getStakingSnapshots(client, args),
    getUserStakingInfo: (args) => getUserStakingInfo(client, args),
    getUserVoteReceipt: (args) => getUserVoteReceipt(client, args),
    getUserVotingPowers: (args) => getUserVotingPowers(client, args),
    getMorphoMarket: (args) => getMorphoMarket(client, args),
    getMorphoMarkets: (args) => getMorphoMarkets(client, args),
    getMorphoMarketUserPosition: (args) =>
      getMorphoMarketUserPosition(client, args),
    getMorphoMarketUserPositions: (args) =>
      getMorphoMarketUserPositions(client, args),
    getMorphoVaultUserPosition: (args) =>
      getMorphoVaultUserPosition(client, args),
    getMorphoVaultUserPositions: (args) =>
      getMorphoVaultUserPositions(client, args),
    getMorphoUserRewards: (args) => getMorphoUserRewards(client, args),
    getMorphoUserStakingRewards: (args) =>
      getMorphoUserStakingRewards(client, args),
    getMorphoVault: (args) => getMorphoVault(client, args),
    getMorphoVaults: (args) => getMorphoVaults(client, args),
    getMorphoUserBalances: (args) => getMorphoUserBalances(client, args),
    getCirculatingSupplySnapshots: (args) =>
      getCirculatingSupplySnapshots(client, args),
    getMarketSnapshots: (args) => getMarketSnapshots(client, args),
    getMorphoVaultSnapshots: (args) => getMorphoVaultSnapshots(client, args),
    getMorphoVaultStakingSnapshots: (args) =>
      getMorphoVaultStakingSnapshots(client, args),
    getUserPositionSnapshots: (args) => getUserPositionSnapshots(client, args),
    getMorphoVaultUserPositionSnapshots: (args) =>
      getMorphoVaultUserPositionSnapshots(client, args),
  };
};
