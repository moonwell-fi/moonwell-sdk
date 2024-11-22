import type { Sidebar } from "vocs";

export const sidebar: Sidebar = {
  "/docs/": [
    {
      text: "Introduction",
      items: [
        { text: "Installation", link: "/docs/installation" },
        { text: "Getting Started", link: "/docs/getting-started" },
      ],
    },
    {
      text: "Actions",
      collapsed: false,
      items: [
        {
          text: "Core",
          collapsed: true,
          items: [
            { text: "getMarket", link: "/docs/actions/core/getMarket" },
            { text: "getMarkets", link: "/docs/actions/core/getMarkets" },
            {
              text: "getUserBalances",
              link: "/docs/actions/core/getUserBalances",
            },
            {
              text: "getUserPosition",
              link: "/docs/actions/core/getUserPosition",
            },
            {
              text: "getUserPositions",
              link: "/docs/actions/core/getUserPositions",
            },
            { text: "getUserReward", link: "/docs/actions/core/getUserReward" },
            {
              text: "getUserRewards",
              link: "/docs/actions/core/getUserRewards",
            },
          ],
        },
        {
          text: "Governance",
          collapsed: true,
          items: [
            {
              text: "getProposal",
              link: "/docs/actions/governance/getProposal",
            },
            {
              text: "getProposals",
              link: "/docs/actions/governance/getProposals",
            },
            {
              text: "getSnapshotProposal",
              link: "/docs/actions/governance/getSnapshotProposal",
            },
            {
              text: "getSnapshotProposals",
              link: "/docs/actions/governance/getSnapshotProposals",
            },
            {
              text: "getDelegates",
              link: "/docs/actions/governance/getDelegates",
            },
            {
              text: "getDiscussions",
              link: "/docs/actions/governance/getDiscussions",
            },
            {
              text: "getGovernanceTokenInfo",
              link: "/docs/actions/governance/getGovernanceTokenInfo",
            },
            {
              text: "getStakingInfo",
              link: "/docs/actions/governance/getStakingInfo",
            },
            {
              text: "getStakingSnapshots",
              link: "/docs/actions/governance/getStakingSnapshots",
            },
            {
              text: "getUserStakingInfo",
              link: "/docs/actions/governance/getUserStakingInfo",
            },
            {
              text: "getUserVoteReceipt",
              link: "/docs/actions/governance/getUserVoteReceipt",
            },
            {
              text: "getUserVotingPowers",
              link: "/docs/actions/governance/getUserVotingPowers",
            },
            {
              text: "getCirculatingSupplySnapshots",
              link: "/docs/actions/governance/getCirculatingSupplySnapshots",
            },
          ],
        },
        {
          text: "Morpho",
          collapsed: true,
          items: [
            {
              text: "getMarketSnapshots",
              link: "/docs/actions/morpho/getMarketSnapshots",
            },
            {
              text: "getMorphoMarket",
              link: "/docs/actions/morpho/getMorphoMarket",
            },
            {
              text: "getMorphoMarkets",
              link: "/docs/actions/morpho/getMorphoMarkets",
            },
            {
              text: "getMorphoMarketUserPosition",
              link: "/docs/actions/morpho/getMorphoMarketUserPosition",
            },
            {
              text: "getMorphoMarketUserPositions",
              link: "/docs/actions/morpho/getMorphoMarketUserPositions",
            },
            {
              text: "getMorphoUserBalances",
              link: "/docs/actions/morpho/getMorphoUserBalances",
            },
            {
              text: "getMorphoUserRewards",
              link: "/docs/actions/morpho/getMorphoUserRewards",
            },
            {
              text: "getMorphoVault",
              link: "/docs/actions/morpho/getMorphoVault",
            },
            {
              text: "getMorphoVaults",
              link: "/docs/actions/morpho/getMorphoVaults",
            },
            {
              text: "getMorphoVaultSnapshots",
              link: "/docs/actions/morpho/getMorphoVaultSnapshots",
            },
            {
              text: "getMorphoVaultUserPosition",
              link: "/docs/actions/morpho/getMorphoVaultUserPosition",
            },
            {
              text: "getMorphoVaultUserPositions",
              link: "/docs/actions/morpho/getMorphoVaultUserPositions",
            },
          ],
        },
      ],
    },
  ],
};
