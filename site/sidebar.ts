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
            {
              text: "Markets Information",
              items: [
                { text: "getMarket", link: "/docs/actions/core/getMarket" },
                { text: "getMarkets", link: "/docs/actions/core/getMarkets" },
                {
                  text: "getMarketSnapshots",
                  link: "/docs/actions/core/getMarketSnapshots",
                },
              ],
            },
            {
              text: "User Positions",
              items: [
                {
                  text: "getUserPosition",
                  link: "/docs/actions/core/getUserPosition",
                },
                {
                  text: "getUserPositions",
                  link: "/docs/actions/core/getUserPositions",
                },
                {
                  text: "getUserBalances",
                  link: "/docs/actions/core/getUserBalances",
                },
                {
                  text: "getUserReward",
                  link: "/docs/actions/core/getUserReward",
                },
                {
                  text: "getUserRewards",
                  link: "/docs/actions/core/getUserRewards",
                },
              ],
            },
          ],
        },
        {
          text: "Morpho",
          collapsed: true,
          items: [
            {
              text: "Isolated Markets",
              items: [
                {
                  text: "getMorphoMarket",
                  link: "/docs/actions/morpho/getMorphoMarket",
                },
                {
                  text: "getMorphoMarkets",
                  link: "/docs/actions/morpho/getMorphoMarkets",
                },
              ],
            },
            {
              text: "Vaults",
              items: [
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
              ],
            },
            {
              text: "User Positions",
              items: [
                {
                  text: "getMorphoMarketUserPosition",
                  link: "/docs/actions/morpho/getMorphoMarketUserPosition",
                },
                {
                  text: "getMorphoMarketUserPositions",
                  link: "/docs/actions/morpho/getMorphoMarketUserPositions",
                },
                {
                  text: "getMorphoVaultUserPosition",
                  link: "/docs/actions/morpho/getMorphoVaultUserPosition",
                },
                {
                  text: "getMorphoVaultUserPositions",
                  link: "/docs/actions/morpho/getMorphoVaultUserPositions",
                },
                {
                  text: "getMorphoUserBalances",
                  link: "/docs/actions/morpho/getMorphoUserBalances",
                },
                {
                  text: "getMorphoUserRewards",
                  link: "/docs/actions/morpho/getMorphoUserRewards",
                },
              ],
            },
          ],
        },
        {
          text: "Governance",
          collapsed: true,
          items: [
            {
              text: "Staking",
              items: [
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
                  text: "getGovernanceTokenInfo",
                  link: "/docs/actions/governance/getGovernanceTokenInfo",
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
              text: "Onchain Proposals",
              items: [
                {
                  text: "getProposal",
                  link: "/docs/actions/governance/getProposal",
                },
                {
                  text: "getProposals",
                  link: "/docs/actions/governance/getProposals",
                },
              ],
            },
            {
              text: "Snapshot Proposals",
              items: [
                {
                  text: "getSnapshotProposal",
                  link: "/docs/actions/governance/getSnapshotProposal",
                },
                {
                  text: "getSnapshotProposals",
                  link: "/docs/actions/governance/getSnapshotProposals",
                },
              ],
            },
            {
              text: "Forum",
              items: [
                {
                  text: "getDelegates",
                  link: "/docs/actions/governance/getDelegates",
                },
                {
                  text: "getDiscussions",
                  link: "/docs/actions/governance/getDiscussions",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
