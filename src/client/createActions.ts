import type { Chain } from "viem";
import {
  type GetMarketParameters,
  getMarket,
} from "../actions/core/markets/getMarket.js";
import {
  type GetMarketsParameters,
  getMarkets,
} from "../actions/core/markets/getMarkets.js";
import type { MoonwellClient } from "./createMoonwellClient.js";

import {
  type GetUserBalancesParameters,
  getUserBalances,
} from "../actions/core/getUserBalances.js";
import {
  type GetUserPositionParameters,
  getUserPosition,
} from "../actions/core/user-positions/getUserPosition.js";
import {
  type GetUserPositionsParameters,
  getUserPositions,
} from "../actions/core/user-positions/getUserPositions.js";
import {
  type GetUserRewardParameters,
  getUserReward,
} from "../actions/core/user-rewards/getUserReward.js";
import {
  type GetUserRewardsParameters,
  getUserRewards,
} from "../actions/core/user-rewards/getUserRewards.js";
import { getDelegates } from "../actions/governance/getDelegates.js";
import { getDiscussions } from "../actions/governance/getDiscussions.js";
import {
  type GetGovernanceTokenInfoParameters,
  getGovernanceTokenInfo,
} from "../actions/governance/getGovernanceTokenInfo.js";
import {
  type GetStakingInfoParameters,
  type GetStakingInfoReturnType,
  getStakingInfo,
} from "../actions/governance/getStakingInfo.js";
import {
  type GetStakingSnapshotsParameters,
  getStakingSnapshots,
} from "../actions/governance/getStakingSnapshots.js";
import {
  type GetUserStakingInfoParameters,
  getUserStakingInfo,
} from "../actions/governance/getUserStakingInfo.js";
import {
  type GetUserVoteReceiptParameters,
  getUserVoteReceipt,
} from "../actions/governance/getUserVoteReceipt.js";
import {
  type GetUserVotingPowersParameters,
  getUserVotingPowers,
} from "../actions/governance/getUserVotingPowers.js";
import {
  type GetProposalParameters,
  getProposal,
} from "../actions/governance/proposals/getProposal.js";
import {
  type GetProposalsParameters,
  getProposals,
} from "../actions/governance/proposals/getProposals.js";
import {
  type GetSnapshotProposalParameters,
  getSnapshotProposal,
} from "../actions/governance/snapshot/getSnapshotProposal.js";
import {
  type GetSnapshotProposalsParameters,
  getSnapshotProposals,
} from "../actions/governance/snapshot/getSnapshotProposals.js";

export const createActions = <environments>(
  client: MoonwellClient<environments>,
) => {
  return {
    getMarket: <chain extends Chain | undefined>(
      args: GetMarketParameters<environments, chain>,
    ) => getMarket<environments, chain>(client, args),
    getMarkets: <chain extends Chain | undefined>(
      args?: GetMarketsParameters<environments, chain>,
    ) => getMarkets<environments, chain>(client, args),

    getUserPosition: <chain extends Chain | undefined>(
      args: GetUserPositionParameters<environments, chain>,
    ) => getUserPosition<environments, chain>(client, args),
    getUserPositions: <chain extends Chain | undefined>(
      args: GetUserPositionsParameters<environments, chain>,
    ) => getUserPositions<environments, chain>(client, args),

    getUserReward: <chain extends Chain | undefined>(
      args: GetUserRewardParameters<environments, chain>,
    ) => getUserReward<environments, chain>(client, args),
    getUserRewards: <chain extends Chain | undefined>(
      args: GetUserRewardsParameters<environments, chain>,
    ) => getUserRewards<environments, chain>(client, args),

    getUserBalances: <chain extends Chain | undefined>(
      args: GetUserBalancesParameters<environments, chain>,
    ) => getUserBalances<environments, chain>(client, args),

    getProposal: <chain extends Chain | undefined>(
      args: GetProposalParameters<environments, chain>,
    ) => getProposal<environments, chain>(client, args),
    getProposals: <chain extends Chain | undefined>(
      args: GetProposalsParameters<environments, chain>,
    ) => getProposals<environments, chain>(client, args),

    getSnapshotProposal: <chain extends Chain | undefined>(
      args: GetSnapshotProposalParameters<environments, chain>,
    ) => getSnapshotProposal<environments, chain>(client, args),
    getSnapshotProposals: <chain extends Chain | undefined>(
      args: GetSnapshotProposalsParameters<environments, chain>,
    ) => getSnapshotProposals<environments, chain>(client, args),

    getDelegates: () => getDelegates(client),

    getDiscussions: () => getDiscussions(client),

    getGovernanceTokenInfo: (args: GetGovernanceTokenInfoParameters) =>
      getGovernanceTokenInfo(client, args),

    getStakingInfo: <chain extends Chain | undefined>(
      args?: GetStakingInfoParameters<environments, chain>,
    ): GetStakingInfoReturnType =>
      getStakingInfo<environments, chain>(client, args),

    getStakingSnapshots: <chain extends Chain | undefined>(
      args?: GetStakingSnapshotsParameters<environments, chain>,
    ) => getStakingSnapshots<environments, chain>(client, args),
    getUserStakingInfo: <chain extends Chain | undefined>(
      args: GetUserStakingInfoParameters<environments, chain>,
    ) => getUserStakingInfo<environments, chain>(client, args),

    getUserVoteReceipt: <chain extends Chain | undefined>(
      args: GetUserVoteReceiptParameters<environments, chain>,
    ) => getUserVoteReceipt<environments, chain>(client, args),

    getUserVotingPowers: <chain extends Chain | undefined>(
      args: GetUserVotingPowersParameters<environments, chain>,
    ) => getUserVotingPowers<environments, chain>(client, args),
  };
};
