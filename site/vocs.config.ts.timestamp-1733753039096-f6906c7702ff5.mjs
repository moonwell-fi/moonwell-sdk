// vocs.config.ts
import { defineConfig } from "file:///Users/leonardo/Moon/moonwell-sdk/site/node_modules/vocs/_lib/index.js";

// ../src/package.json
var package_default = {
  name: "@moonwell-fi/moonwell-sdk",
  description: "TypeScript Interface for Moonwell",
  version: "0.5.2",
  type: "module",
  main: "./_cjs/index.js",
  module: "./_esm/index.js",
  types: "./_types/index.d.ts",
  typings: "./_types/index.d.ts",
  sideEffects: false,
  files: [
    "*",
    "!**/*.bench.ts",
    "!**/*.bench-d.ts",
    "!**/*.test.ts",
    "!**/*.test.ts.snap",
    "!**/*.test-d.ts",
    "!**/*.tsbuildinfo",
    "!tsconfig.build.json",
    "!jsr.json",
  ],
  exports: {
    ".": {
      types: "./_types/index.d.ts",
      import: "./_esm/index.js",
      default: "./_cjs/index.js",
    },
    "./actions": {
      types: "./_types/actions/index.d.ts",
      import: "./_esm/actions/index.js",
      default: "./_cjs/actions/index.js",
    },
    "./client": {
      types: "./_types/client/index.d.ts",
      import: "./_esm/client/index.js",
      default: "./_cjs/client/index.js",
    },
    "./common": {
      types: "./_types/common/index.d.ts",
      import: "./_esm/common/index.js",
      default: "./_cjs/common/index.js",
    },
    "./environments": {
      types: "./_types/environments/index.d.ts",
      import: "./_esm/environments/index.js",
      default: "./_cjs/environments/index.js",
    },
    "./package.json": "./package.json",
  },
  typesVersions: {
    "*": {
      actions: ["./_types/actions/index.d.ts"],
    },
  },
  peerDependencies: {
    typescript: ">=5.0.4",
  },
  peerDependenciesMeta: {
    typescript: {
      optional: true,
    },
  },
  dependencies: {
    "@types/lodash": "^4.17.9",
    axios: "^1.7.7",
    lodash: "^4.17.21",
    viem: "^2.21.16",
  },
  license: "MIT",
  homepage: "https://moonwell.fi",
  repository: "moonwell-fi/moonwell-sdk",
  authors: ["x0s0l.eth"],
  keywords: [
    "eth",
    "ethereum",
    "dapps",
    "sdk",
    "moonwell",
    "web3",
    "typescript",
  ],
};

// sidebar.ts
var sidebar = {
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
                  text: "getUserStakingInfo",
                  link: "/docs/actions/governance/getUserStakingInfo",
                },
                {
                  text: "getGovernanceTokenInfo",
                  link: "/docs/actions/governance/getGovernanceTokenInfo",
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
            {
              text: "User Votes",
              items: [
                {
                  text: "getUserVoteReceipt",
                  link: "/docs/actions/governance/getUserVoteReceipt",
                },
                {
                  text: "getUserVotingPowers",
                  link: "/docs/actions/governance/getUserVotingPowers",
                },
              ],
            },
          ],
        },
        {
          text: "Historical Data",
          collapsed: true,
          items: [
            {
              text: "getMarketSnapshots",
              link: "/docs/actions/core/getMarketSnapshots",
            },
            {
              text: "getMorphoVaultSnapshots",
              link: "/docs/actions/morpho/getMorphoVaultSnapshots",
            },
            {
              text: "getStakingSnapshots",
              link: "/docs/actions/governance/getStakingSnapshots",
            },
            {
              text: "getCirculatingSupplySnapshots",
              link: "/docs/actions/governance/getCirculatingSupplySnapshots",
            },
          ],
        },
      ],
    },
  ],
};

// vocs.config.ts
var vocs_config_default = defineConfig({
  theme: {
    variables: {
      color: {
        // white: { light: string, dark: string },
        // black: { light: string, dark: string },
        background: { light: "#FFFFFF", dark: "#232225" },
        // background2: { light: string, dark: string },
        // background3: { light: string, dark: string },
        // background4: { light: string, dark: string },
        // background5: { light: string, dark: string },
        backgroundAccent: { light: "#2474da", dark: "#2474da" },
        backgroundAccentHover: { light: "#2474DA", dark: "#2474DA" },
        // backgroundAccentText: { light: string, dark: string },
        // backgroundBlueTint: { light: string, dark: string },
        // backgroundDark: { light: string, dark: string },
        // backgroundGreenTint: { light: string, dark: string },
        // backgroundGreenTint2: { light: string, dark: string },
        // backgroundIrisTint: { light: string, dark: string },
        // backgroundRedTint: { light: string, dark: string },
        // backgroundRedTint2: { light: string, dark: string },
        // backgroundYellowTint: { light: string, dark: string },
        // border: { light: string, dark: string },
        // border2: { light: string, dark: string },
        borderAccent: { light: "#2474DA", dark: "#2474DA" },
        // borderBlue: { light: string, dark: string },
        // borderGreen: { light: string, dark: string },
        // borderIris: { light: string, dark: string },
        // borderRed: { light: string, dark: string },
        // borderYellow: { light: string, dark: string },
        // heading: { light: string, dark: string },
        // shadow: { light: string, dark: string },
        // text: { light: string, dark: string },
        // text2: { light: string, dark: string },
        // text3: { light: string, dark: string },
        // text4: { light: string, dark: string },
        textAccent: { light: "#2474da", dark: "#2474da" },
        textAccentHover: { light: "#2474DA", dark: "#2474DA" },
        // textBlue: { light: string, dark: string },
        // textBlueHover: { light: string, dark: string },
        // textGreen: { light: string, dark: string },
        // textGreenHover: { light: string, dark: string },
        // textIris: { light: string, dark: string },
        // textIrisHover: { light: string, dark: string },
        // textRed: { light: string, dark: string },
        // textRedHover: { light: string, dark: string },
        // textYellow: { light: string, dark: string },
        // textYellowHover: { light: string, dark: string },
        // blockquoteBorder: { light: string, dark: string },
        // blockquoteText: { light: string, dark: string },
        // codeBlockBackground: { light: string, dark: string },
        // codeCharacterHighlightBackground: { light: string, dark: string },
        // codeHighlightBackground: { light: string, dark: string },
        // codeHighlightBorder: { light: string, dark: string },
        // codeInlineBackground: { light: string, dark: string },
        // codeInlineBorder: { light: string, dark: string },
        // codeInlineText: { light: string, dark: string },
        // codeTitleBackground: { light: string, dark: string },
        // dangerBackground: { light: string, dark: string },
        // dangerBorder: { light: string, dark: string },
        // dangerText: { light: string, dark: string },
        // dangerTextHover: { light: string, dark: string },
        // hr: { light: string, dark: string },
        // infoBackground: { light: string, dark: string },
        // infoBorder: { light: string, dark: string },
        // infoText: { light: string, dark: string },
        // infoTextHover: { light: string, dark: string },
        // lineNumber: { light: string, dark: string },
        // link: { light: string, dark: string },
        // linkHover: { light: string, dark: string },
        // noteBackground: { light: string, dark: string },
        // noteBorder: { light: string, dark: string },
        // noteText: { light: string, dark: string },
        // successBackground: { light: string, dark: string },
        // successBorder: { light: string, dark: string },
        // successText: { light: string, dark: string },
        // successTextHover: { light: string, dark: string },
        // tableBorder: { light: string, dark: string },
        // tableHeaderBackground: { light: string, dark: string },
        // tableHeaderText: { light: string, dark: string },
        // tipBackground: { light: string, dark: string },
        // tipBorder: { light: string, dark: string },
        // tipText: { light: string, dark: string },
        // tipTextHover: { light: string, dark: string },
        // warningBackground: { light: string, dark: string },
        // warningBorder: { light: string, dark: string },
        // warningText: { light: string, dark: string },
        // warningTextHover: { light: string, dark: string },
      },
    },
  },
  rootDir: ".",
  title: "Moonwell SDK",
  iconUrl: "favicon.svg",
  sidebar,
  socials: [
    {
      icon: "github",
      link: "https://github.com/moonwell-fi",
    },
    {
      icon: "discord",
      link: "https://discord.gg/moonwellfi",
    },
    {
      icon: "x",
      link: "https://x.com/MoonwellDeFi",
    },
  ],
  topNav: [
    { text: "Docs", link: "/docs/getting-started", match: "/docs" },
    {
      text: package_default.version,
      items: [
        {
          text: "Changelog",
          link: "https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/CHANGELOG.md",
        },
        {
          text: "Contributing",
          link: "https://github.com/moonwell-fi/moonwell-sdk/blob/main/.github/CONTRIBUTING.md",
        },
      ],
    },
  ],
});
export { vocs_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiLCAiLi4vc3JjL3BhY2thZ2UuanNvbiIsICJzaWRlYmFyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2xlb25hcmRvL01vb24vbW9vbndlbGwtc2RrL3NpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9sZW9uYXJkby9Nb29uL21vb253ZWxsLXNkay9zaXRlL3ZvY3MuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9sZW9uYXJkby9Nb29uL21vb253ZWxsLXNkay9zaXRlL3ZvY3MuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZvY3NcIjtcbmltcG9ydCBwa2cgZnJvbSBcIi4uL3NyYy9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCB7IHNpZGViYXIgfSBmcm9tIFwiLi9zaWRlYmFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRoZW1lOiB7XG4gICAgdmFyaWFibGVzOiB7XG4gICAgICBjb2xvcjoge1xuICAgICAgICAvLyB3aGl0ZTogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmxhY2s6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIGJhY2tncm91bmQ6IHsgbGlnaHQ6IFwiI0ZGRkZGRlwiLCBkYXJrOiBcIiMyMzIyMjVcIiB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kMjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZDM6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmQ0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kNTogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgYmFja2dyb3VuZEFjY2VudDogeyBsaWdodDogXCIjMjQ3NGRhXCIsIGRhcms6IFwiIzI0NzRkYVwiIH0sXG4gICAgICAgIGJhY2tncm91bmRBY2NlbnRIb3ZlcjogeyBsaWdodDogXCIjMjQ3NERBXCIsIGRhcms6IFwiIzI0NzREQVwiIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmRBY2NlbnRUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kQmx1ZVRpbnQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmREYXJrOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kR3JlZW5UaW50OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kR3JlZW5UaW50MjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZElyaXNUaW50OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kUmVkVGludDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZFJlZFRpbnQyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kWWVsbG93VGludDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXIyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICBib3JkZXJBY2NlbnQ6IHsgbGlnaHQ6IFwiIzI0NzREQVwiLCBkYXJrOiBcIiMyNDc0REFcIiB9LFxuICAgICAgICAvLyBib3JkZXJCbHVlOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXJHcmVlbjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVySXJpczogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVyUmVkOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXJZZWxsb3c6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGhlYWRpbmc6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHNoYWRvdzogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dDI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRleHQzOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0NDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgdGV4dEFjY2VudDogeyBsaWdodDogXCIjMjQ3NGRhXCIsIGRhcms6IFwiIzI0NzRkYVwiIH0sXG4gICAgICAgIHRleHRBY2NlbnRIb3ZlcjogeyBsaWdodDogXCIjMjQ3NERBXCIsIGRhcms6IFwiIzI0NzREQVwiIH0sXG4gICAgICAgIC8vIHRleHRCbHVlOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0Qmx1ZUhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0R3JlZW46IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRleHRHcmVlbkhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0SXJpczogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dElyaXNIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dFJlZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dFJlZEhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0WWVsbG93OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0WWVsbG93SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJsb2NrcXVvdGVCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJsb2NrcXVvdGVUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlQmxvY2tCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlQ2hhcmFjdGVySGlnaGxpZ2h0QmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gY29kZUhpZ2hsaWdodEJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGNvZGVIaWdobGlnaHRCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGNvZGVJbmxpbmVCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlSW5saW5lQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlSW5saW5lVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gY29kZVRpdGxlQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gZGFuZ2VyQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gZGFuZ2VyQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBkYW5nZXJUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBkYW5nZXJUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGhyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBpbmZvQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gaW5mb0JvcmRlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gaW5mb1RleHQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGluZm9UZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbmVOdW1iZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbms6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbmtIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gbm90ZUJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIG5vdGVCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIG5vdGVUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBzdWNjZXNzQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gc3VjY2Vzc0JvcmRlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gc3VjY2Vzc1RleHQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHN1Y2Nlc3NUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRhYmxlQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0YWJsZUhlYWRlckJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRhYmxlSGVhZGVyVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGlwQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGlwQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0aXBUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0aXBUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHdhcm5pbmdCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB3YXJuaW5nQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB3YXJuaW5nVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gd2FybmluZ1RleHRIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcm9vdERpcjogXCIuXCIsXG4gIHRpdGxlOiBcIk1vb253ZWxsIFNES1wiLFxuICBpY29uVXJsOiBcImZhdmljb24uc3ZnXCIsXG4gIHNpZGViYXIsXG4gIHNvY2lhbHM6IFtcbiAgICB7XG4gICAgICBpY29uOiBcImdpdGh1YlwiLFxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbW9vbndlbGwtZmlcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIGljb246IFwiZGlzY29yZFwiLFxuICAgICAgbGluazogXCJodHRwczovL2Rpc2NvcmQuZ2cvbW9vbndlbGxmaVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgaWNvbjogXCJ4XCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8veC5jb20vTW9vbndlbGxEZUZpXCIsXG4gICAgfSxcbiAgXSxcbiAgdG9wTmF2OiBbXG4gICAgeyB0ZXh0OiBcIkRvY3NcIiwgbGluazogXCIvZG9jcy9nZXR0aW5nLXN0YXJ0ZWRcIiwgbWF0Y2g6IFwiL2RvY3NcIiB9LFxuICAgIHtcbiAgICAgIHRleHQ6IHBrZy52ZXJzaW9uLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ2hhbmdlbG9nXCIsXG4gICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbW9vbndlbGwtZmkvbW9vbndlbGwtc2RrL2Jsb2IvbWFpbi9zcmMvQ0hBTkdFTE9HLm1kXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLFxuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL21vb253ZWxsLWZpL21vb253ZWxsLXNkay9ibG9iL21haW4vLmdpdGh1Yi9DT05UUklCVVRJTkcubWRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQG1vb253ZWxsLWZpL21vb253ZWxsLXNka1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiVHlwZVNjcmlwdCBJbnRlcmZhY2UgZm9yIE1vb253ZWxsXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuNS4yXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcIm1haW5cIjogXCIuL19janMvaW5kZXguanNcIixcbiAgXCJtb2R1bGVcIjogXCIuL19lc20vaW5kZXguanNcIixcbiAgXCJ0eXBlc1wiOiBcIi4vX3R5cGVzL2luZGV4LmQudHNcIixcbiAgXCJ0eXBpbmdzXCI6IFwiLi9fdHlwZXMvaW5kZXguZC50c1wiLFxuICBcInNpZGVFZmZlY3RzXCI6IGZhbHNlLFxuICBcImZpbGVzXCI6IFtcbiAgICBcIipcIixcbiAgICBcIiEqKi8qLmJlbmNoLnRzXCIsXG4gICAgXCIhKiovKi5iZW5jaC1kLnRzXCIsXG4gICAgXCIhKiovKi50ZXN0LnRzXCIsXG4gICAgXCIhKiovKi50ZXN0LnRzLnNuYXBcIixcbiAgICBcIiEqKi8qLnRlc3QtZC50c1wiLFxuICAgIFwiISoqLyoudHNidWlsZGluZm9cIixcbiAgICBcIiF0c2NvbmZpZy5idWlsZC5qc29uXCIsXG4gICAgXCIhanNyLmpzb25cIlxuICBdLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9fdHlwZXMvaW5kZXguZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL19lc20vaW5kZXguanNcIixcbiAgICAgIFwiZGVmYXVsdFwiOiBcIi4vX2Nqcy9pbmRleC5qc1wiXG4gICAgfSxcbiAgICBcIi4vYWN0aW9uc1wiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9fdHlwZXMvYWN0aW9ucy9pbmRleC5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vX2VzbS9hY3Rpb25zL2luZGV4LmpzXCIsXG4gICAgICBcImRlZmF1bHRcIjogXCIuL19janMvYWN0aW9ucy9pbmRleC5qc1wiXG4gICAgfSxcbiAgICBcIi4vY2xpZW50XCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL190eXBlcy9jbGllbnQvaW5kZXguZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL19lc20vY2xpZW50L2luZGV4LmpzXCIsXG4gICAgICBcImRlZmF1bHRcIjogXCIuL19janMvY2xpZW50L2luZGV4LmpzXCJcbiAgICB9LFxuICAgIFwiLi9jb21tb25cIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vX3R5cGVzL2NvbW1vbi9pbmRleC5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vX2VzbS9jb21tb24vaW5kZXguanNcIixcbiAgICAgIFwiZGVmYXVsdFwiOiBcIi4vX2Nqcy9jb21tb24vaW5kZXguanNcIlxuICAgIH0sXG4gICAgXCIuL2Vudmlyb25tZW50c1wiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9fdHlwZXMvZW52aXJvbm1lbnRzL2luZGV4LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9fZXNtL2Vudmlyb25tZW50cy9pbmRleC5qc1wiLFxuICAgICAgXCJkZWZhdWx0XCI6IFwiLi9fY2pzL2Vudmlyb25tZW50cy9pbmRleC5qc1wiXG4gICAgfSxcbiAgICBcIi4vcGFja2FnZS5qc29uXCI6IFwiLi9wYWNrYWdlLmpzb25cIlxuICB9LFxuICBcInR5cGVzVmVyc2lvbnNcIjoge1xuICAgIFwiKlwiOiB7XG4gICAgICBcImFjdGlvbnNcIjogW1wiLi9fdHlwZXMvYWN0aW9ucy9pbmRleC5kLnRzXCJdXG4gICAgfVxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwidHlwZXNjcmlwdFwiOiBcIj49NS4wLjRcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNNZXRhXCI6IHtcbiAgICBcInR5cGVzY3JpcHRcIjoge1xuICAgICAgXCJvcHRpb25hbFwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTcuOVwiLFxuICAgIFwiYXhpb3NcIjogXCJeMS43LjdcIixcbiAgICBcImxvZGFzaFwiOiBcIl40LjE3LjIxXCIsXG4gICAgXCJ2aWVtXCI6IFwiXjIuMjEuMTZcIlxuICB9LFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vbW9vbndlbGwuZmlcIixcbiAgXCJyZXBvc2l0b3J5XCI6IFwibW9vbndlbGwtZmkvbW9vbndlbGwtc2RrXCIsXG4gIFwiYXV0aG9yc1wiOiBbXCJ4MHMwbC5ldGhcIl0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZXRoXCIsXG4gICAgXCJldGhlcmV1bVwiLFxuICAgIFwiZGFwcHNcIixcbiAgICBcInNka1wiLFxuICAgIFwibW9vbndlbGxcIixcbiAgICBcIndlYjNcIixcbiAgICBcInR5cGVzY3JpcHRcIlxuICBdXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9sZW9uYXJkby9Nb29uL21vb253ZWxsLXNkay9zaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbGVvbmFyZG8vTW9vbi9tb29ud2VsbC1zZGsvc2l0ZS9zaWRlYmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9sZW9uYXJkby9Nb29uL21vb253ZWxsLXNkay9zaXRlL3NpZGViYXIudHNcIjtpbXBvcnQgdHlwZSB7IFNpZGViYXIgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgY29uc3Qgc2lkZWJhcjogU2lkZWJhciA9IHtcbiAgXCIvZG9jcy9cIjogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiSW5zdGFsbGF0aW9uXCIsIGxpbms6IFwiL2RvY3MvaW5zdGFsbGF0aW9uXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIkdldHRpbmcgU3RhcnRlZFwiLCBsaW5rOiBcIi9kb2NzL2dldHRpbmctc3RhcnRlZFwiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJBY3Rpb25zXCIsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ29yZVwiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk1hcmtldHMgSW5mb3JtYXRpb25cIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiZ2V0TWFya2V0XCIsIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldE1hcmtldFwiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcImdldE1hcmtldHNcIiwgbGluazogXCIvZG9jcy9hY3Rpb25zL2NvcmUvZ2V0TWFya2V0c1wiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVzZXIgUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyUG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldFVzZXJQb3NpdGlvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRVc2VyUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFVzZXJCYWxhbmNlc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2NvcmUvZ2V0VXNlckJhbGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFVzZXJSZXdhcmRcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldFVzZXJSZXdhcmRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclJld2FyZHNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldFVzZXJSZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiTW9ycGhvXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiSXNvbGF0ZWQgTWFya2V0c1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvTWFya2V0XCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob01hcmtldFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9NYXJrZXRzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob01hcmtldHNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJWYXVsdHNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1ZhdWx0XCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob1ZhdWx0XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1ZhdWx0c1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9WYXVsdHNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJVc2VyIFBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvTWFya2V0VXNlclBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob01hcmtldFVzZXJQb3NpdGlvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9NYXJrZXRVc2VyUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob01hcmtldFVzZXJQb3NpdGlvbnNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvVmF1bHRVc2VyUG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9tb3JwaG8vZ2V0TW9ycGhvVmF1bHRVc2VyUG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvVmF1bHRVc2VyUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob1ZhdWx0VXNlclBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9Vc2VyQmFsYW5jZXNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9tb3JwaG8vZ2V0TW9ycGhvVXNlckJhbGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1VzZXJSZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob1VzZXJSZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR292ZXJuYW5jZVwiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlN0YWtpbmdcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFN0YWtpbmdJbmZvXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRTdGFraW5nSW5mb1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyU3Rha2luZ0luZm9cIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFVzZXJTdGFraW5nSW5mb1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRHb3Zlcm5hbmNlVG9rZW5JbmZvXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRHb3Zlcm5hbmNlVG9rZW5JbmZvXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiT25jaGFpbiBQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFByb3Bvc2FsXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRQcm9wb3NhbFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFByb3Bvc2Fsc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlNuYXBzaG90IFByb3Bvc2Fsc1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0U25hcHNob3RQcm9wb3NhbFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0U25hcHNob3RQcm9wb3NhbFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRTbmFwc2hvdFByb3Bvc2Fsc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0U25hcHNob3RQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJGb3J1bVwiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RGVsZWdhdGVzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXREZWxlZ2F0ZXNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RGlzY3Vzc2lvbnNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldERpc2N1c3Npb25zXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVXNlciBWb3Rlc1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclZvdGVSZWNlaXB0XCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRVc2VyVm90ZVJlY2VpcHRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclZvdGluZ1Bvd2Vyc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0VXNlclZvdGluZ1Bvd2Vyc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkhpc3RvcmljYWwgRGF0YVwiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcImdldE1hcmtldFNuYXBzaG90c1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRNYXJrZXRTbmFwc2hvdHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvVmF1bHRTbmFwc2hvdHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9WYXVsdFNuYXBzaG90c1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJnZXRTdGFraW5nU25hcHNob3RzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFN0YWtpbmdTbmFwc2hvdHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiZ2V0Q2lyY3VsYXRpbmdTdXBwbHlTbmFwc2hvdHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0Q2lyY3VsYXRpbmdTdXBwbHlTbmFwc2hvdHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9TLFNBQVMsb0JBQW9COzs7QUNBalU7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLE1BQVE7QUFBQSxFQUNSLFFBQVU7QUFBQSxFQUNWLE9BQVM7QUFBQSxFQUNULFNBQVc7QUFBQSxFQUNYLGFBQWU7QUFBQSxFQUNmLE9BQVM7QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFB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Z0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE9BQU87QUFBQSxnQkFDTDtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FGbE5BLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxNQUNULE9BQU87QUFBQTtBQUFBO0FBQUEsUUFHTCxZQUFZLEVBQUUsT0FBTyxXQUFXLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLaEQsa0JBQWtCLEVBQUUsT0FBTyxXQUFXLE1BQU0sVUFBVTtBQUFBLFFBQ3RELHVCQUF1QixFQUFFLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFZM0QsY0FBYyxFQUFFLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFZbEQsWUFBWSxFQUFFLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFBQSxRQUNoRCxpQkFBaUIsRUFBRSxPQUFPLFdBQVcsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BbUR2RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsRUFDVCxPQUFPO0FBQUEsRUFDUCxTQUFTO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLEVBQUUsTUFBTSxRQUFRLE1BQU0seUJBQXlCLE9BQU8sUUFBUTtBQUFBLElBQzlEO0FBQUEsTUFDRSxNQUFNLGdCQUFJO0FBQUEsTUFDVixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
