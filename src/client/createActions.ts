import type { Chain } from "viem";
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
  type GetMorphoVaultParameters,
  type GetMorphoVaultReturnType,
  getMorphoVault,
} from "../actions/morpho/vaults/getMorphoVault.js";
import {
  type GetMorphoVaultsParameters,
  type GetMorphoVaultsReturnType,
  getMorphoVaults,
} from "../actions/morpho/vaults/getMorphoVaults.js";

export const createActions = <environments>(
  client: MoonwellClient<environments>,
) => {
  return {
    getMarket: <chain extends Chain | undefined>(
      args: GetMarketParameters<environments, chain>,
    ): GetMarketReturnType => getMarket<environments, chain>(client, args),

    getMarkets: <chain extends Chain | undefined>(
      args?: GetMarketsParameters<environments, chain>,
    ): GetMarketsReturnType => getMarkets<environments, chain>(client, args),

    getUserPosition: <chain extends Chain | undefined>(
      args: GetUserPositionParameters<environments, chain>,
    ): GetUserPositionReturnType =>
      getUserPosition<environments, chain>(client, args),

    getUserPositions: <chain extends Chain | undefined>(
      args: GetUserPositionsParameters<environments, chain>,
    ): GetUserPositionsReturnType =>
      getUserPositions<environments, chain>(client, args),

    getUserReward: <chain extends Chain | undefined>(
      args: GetUserRewardParameters<environments, chain>,
    ): GetUserRewardReturnType =>
      getUserReward<environments, chain>(client, args),

    getUserRewards: <chain extends Chain | undefined>(
      args: GetUserRewardsParameters<environments, chain>,
    ): GetUserRewardsReturnType =>
      getUserRewards<environments, chain>(client, args),

    getUserBalances: <chain extends Chain | undefined>(
      args: GetUserBalancesParameters<environments, chain>,
    ): GetUserBalancesReturnType =>
      getUserBalances<environments, chain>(client, args),

    getProposal: <chain extends Chain | undefined>(
      args: GetProposalParameters<environments, chain>,
    ): GetProposalReturnType => getProposal<environments, chain>(client, args),

    getProposals: <chain extends Chain | undefined>(
      args?: GetProposalsParameters<environments, chain>,
    ): GetProposalsReturnType =>
      getProposals<environments, chain>(client, args),

    getSnapshotProposal: <chain extends Chain | undefined>(
      args: GetSnapshotProposalParameters<environments, chain>,
    ): GetSnapshotProposalReturnType =>
      getSnapshotProposal<environments, chain>(client, args),

    getSnapshotProposals: <chain extends Chain | undefined>(
      args?: GetSnapshotProposalsParameters<environments, chain>,
    ): GetSnapshotProposalsReturnType =>
      getSnapshotProposals<environments, chain>(client, args),

    getDelegates: (): GetDelegatesReturnType => getDelegates(client),

    getDiscussions: (): GetDiscussionsReturnType => getDiscussions(client),

    getGovernanceTokenInfo: (
      args: GetGovernanceTokenInfoParameters,
    ): GetGovernanceTokenInfoReturnType => getGovernanceTokenInfo(client, args),

    getStakingInfo: <chain extends Chain | undefined>(
      args?: GetStakingInfoParameters<environments, chain>,
    ): GetStakingInfoReturnType =>
      getStakingInfo<environments, chain>(client, args),

    getStakingSnapshots: <chain extends Chain | undefined>(
      args?: GetStakingSnapshotsParameters<environments, chain>,
    ): GetStakingSnapshotsReturnType =>
      getStakingSnapshots<environments, chain>(client, args),

    getUserStakingInfo: <chain extends Chain | undefined>(
      args: GetUserStakingInfoParameters<environments, chain>,
    ): GetUserStakingInfoReturnType =>
      getUserStakingInfo<environments, chain>(client, args),

    getUserVoteReceipt: <chain extends Chain | undefined>(
      args: GetUserVoteReceiptParameters<environments, chain>,
    ): GetUserVoteReceiptReturnType =>
      getUserVoteReceipt<environments, chain>(client, args),

    getUserVotingPowers: <chain extends Chain | undefined>(
      args: GetUserVotingPowersParameters<environments, chain>,
    ): GetUserVotingPowersReturnType =>
      getUserVotingPowers<environments, chain>(client, args),

    getMorphoMarket: <chain extends Chain | undefined>(
      args: GetMorphoMarketParameters<environments, chain>,
    ): GetMorphoMarketReturnType =>
      getMorphoMarket<environments, chain>(client, args),

    getMorphoMarkets: <chain extends Chain | undefined>(
      args?: GetMorphoMarketsParameters<environments, chain>,
    ): GetMorphoMarketsReturnType =>
      getMorphoMarkets<environments, chain>(client, args),

    getMorphoMarketUserPosition: <chain extends Chain | undefined>(
      args: GetMorphoMarketUserPositionParameters<environments, chain>,
    ): GetMorphoMarketUserPositionReturnType =>
      getMorphoMarketUserPosition<environments, chain>(client, args),

    getMorphoMarketUserPositions: <chain extends Chain | undefined>(
      args: GetMorphoMarketUserPositionsParameters<environments, chain>,
    ): GetMorphoMarketUserPositionsReturnType =>
      getMorphoMarketUserPositions<environments, chain>(client, args),

    getMorphoVaultUserPosition: <chain extends Chain | undefined>(
      args: GetMorphoVaultUserPositionParameters<environments, chain>,
    ): GetMorphoVaultUserPositionReturnType =>
      getMorphoVaultUserPosition<environments, chain>(client, args),

    getMorphoVaultUserPositions: <chain extends Chain | undefined>(
      args: GetMorphoVaultUserPositionsParameters<environments, chain>,
    ): GetMorphoVaultUserPositionsReturnType =>
      getMorphoVaultUserPositions<environments, chain>(client, args),

    getMorphoUserRewards: <chain extends Chain | undefined>(
      args: GetMorphoUserRewardsParameters<environments, chain>,
    ): GetMorphoUserRewardsReturnType =>
      getMorphoUserRewards<environments, chain>(client, args),

    getMorphoVault: <chain extends Chain | undefined>(
      args: GetMorphoVaultParameters<environments, chain>,
    ): GetMorphoVaultReturnType =>
      getMorphoVault<environments, chain>(client, args),

    getMorphoVaults: <chain extends Chain | undefined>(
      args: GetMorphoVaultsParameters<environments, chain>,
    ): GetMorphoVaultsReturnType =>
      getMorphoVaults<environments, chain>(client, args),

    getMorphoUserBalances: <chain extends Chain | undefined>(
      args: GetMorphoUserBalancesParameters<environments, chain>,
    ): GetMorphoUserBalancesReturnType =>
      getMorphoUserBalances<environments, chain>(client, args),
  };
};
