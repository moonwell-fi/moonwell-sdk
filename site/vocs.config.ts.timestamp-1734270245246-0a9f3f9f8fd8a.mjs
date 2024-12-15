// vocs.config.ts
import { defineConfig } from "file:///Users/henry/Moonwell/moonwell-sdk/node_modules/.pnpm/vocs@1.0.0-alpha.62_@types+node@12.20.55_@types+react@18.3.12_acorn@8.14.0_react-dom@18.3.1_r_7tbawochqxx7lqir7lzxkp42u4/node_modules/vocs/_lib/index.js";

// ../src/package.json
var package_default = {
  name: "@moonwell-fi/moonwell-sdk",
  description: "TypeScript Interface for Moonwell",
  version: "0.5.13",
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
    dayjs: "^1.11.13",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiLCAiLi4vc3JjL3BhY2thZ2UuanNvbiIsICJzaWRlYmFyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2hlbnJ5L01vb253ZWxsL21vb253ZWxsLXNkay9zaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvaGVucnkvTW9vbndlbGwvbW9vbndlbGwtc2RrL3NpdGUvdm9jcy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2hlbnJ5L01vb253ZWxsL21vb253ZWxsLXNkay9zaXRlL3ZvY3MuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZvY3NcIjtcbmltcG9ydCBwa2cgZnJvbSBcIi4uL3NyYy9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCB7IHNpZGViYXIgfSBmcm9tIFwiLi9zaWRlYmFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRoZW1lOiB7XG4gICAgdmFyaWFibGVzOiB7XG4gICAgICBjb2xvcjoge1xuICAgICAgICAvLyB3aGl0ZTogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmxhY2s6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIGJhY2tncm91bmQ6IHsgbGlnaHQ6IFwiI0ZGRkZGRlwiLCBkYXJrOiBcIiMyMzIyMjVcIiB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kMjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZDM6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmQ0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kNTogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgYmFja2dyb3VuZEFjY2VudDogeyBsaWdodDogXCIjMjQ3NGRhXCIsIGRhcms6IFwiIzI0NzRkYVwiIH0sXG4gICAgICAgIGJhY2tncm91bmRBY2NlbnRIb3ZlcjogeyBsaWdodDogXCIjMjQ3NERBXCIsIGRhcms6IFwiIzI0NzREQVwiIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmRBY2NlbnRUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kQmx1ZVRpbnQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJhY2tncm91bmREYXJrOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kR3JlZW5UaW50OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kR3JlZW5UaW50MjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZElyaXNUaW50OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kUmVkVGludDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYmFja2dyb3VuZFJlZFRpbnQyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBiYWNrZ3JvdW5kWWVsbG93VGludDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXIyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICBib3JkZXJBY2NlbnQ6IHsgbGlnaHQ6IFwiIzI0NzREQVwiLCBkYXJrOiBcIiMyNDc0REFcIiB9LFxuICAgICAgICAvLyBib3JkZXJCbHVlOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXJHcmVlbjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVySXJpczogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gYm9yZGVyUmVkOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBib3JkZXJZZWxsb3c6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGhlYWRpbmc6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHNoYWRvdzogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dDI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRleHQzOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0NDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgdGV4dEFjY2VudDogeyBsaWdodDogXCIjMjQ3NGRhXCIsIGRhcms6IFwiIzI0NzRkYVwiIH0sXG4gICAgICAgIHRleHRBY2NlbnRIb3ZlcjogeyBsaWdodDogXCIjMjQ3NERBXCIsIGRhcms6IFwiIzI0NzREQVwiIH0sXG4gICAgICAgIC8vIHRleHRCbHVlOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0Qmx1ZUhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0R3JlZW46IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRleHRHcmVlbkhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0SXJpczogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dElyaXNIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dFJlZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGV4dFJlZEhvdmVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0WWVsbG93OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0ZXh0WWVsbG93SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJsb2NrcXVvdGVCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGJsb2NrcXVvdGVUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlQmxvY2tCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlQ2hhcmFjdGVySGlnaGxpZ2h0QmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gY29kZUhpZ2hsaWdodEJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGNvZGVIaWdobGlnaHRCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGNvZGVJbmxpbmVCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlSW5saW5lQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBjb2RlSW5saW5lVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gY29kZVRpdGxlQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gZGFuZ2VyQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gZGFuZ2VyQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBkYW5nZXJUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBkYW5nZXJUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGhyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBpbmZvQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gaW5mb0JvcmRlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gaW5mb1RleHQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGluZm9UZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbmVOdW1iZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbms6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIGxpbmtIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gbm90ZUJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIG5vdGVCb3JkZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIG5vdGVUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyBzdWNjZXNzQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gc3VjY2Vzc0JvcmRlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gc3VjY2Vzc1RleHQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHN1Y2Nlc3NUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRhYmxlQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0YWJsZUhlYWRlckJhY2tncm91bmQ6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHRhYmxlSGVhZGVyVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGlwQmFja2dyb3VuZDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gdGlwQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0aXBUZXh0OiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB0aXBUZXh0SG92ZXI6IHsgbGlnaHQ6IHN0cmluZywgZGFyazogc3RyaW5nIH0sXG4gICAgICAgIC8vIHdhcm5pbmdCYWNrZ3JvdW5kOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB3YXJuaW5nQm9yZGVyOiB7IGxpZ2h0OiBzdHJpbmcsIGRhcms6IHN0cmluZyB9LFxuICAgICAgICAvLyB3YXJuaW5nVGV4dDogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgICAgLy8gd2FybmluZ1RleHRIb3ZlcjogeyBsaWdodDogc3RyaW5nLCBkYXJrOiBzdHJpbmcgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcm9vdERpcjogXCIuXCIsXG4gIHRpdGxlOiBcIk1vb253ZWxsIFNES1wiLFxuICBpY29uVXJsOiBcImZhdmljb24uc3ZnXCIsXG4gIHNpZGViYXIsXG4gIHNvY2lhbHM6IFtcbiAgICB7XG4gICAgICBpY29uOiBcImdpdGh1YlwiLFxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbW9vbndlbGwtZmlcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIGljb246IFwiZGlzY29yZFwiLFxuICAgICAgbGluazogXCJodHRwczovL2Rpc2NvcmQuZ2cvbW9vbndlbGxmaVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgaWNvbjogXCJ4XCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8veC5jb20vTW9vbndlbGxEZUZpXCIsXG4gICAgfSxcbiAgXSxcbiAgdG9wTmF2OiBbXG4gICAgeyB0ZXh0OiBcIkRvY3NcIiwgbGluazogXCIvZG9jcy9nZXR0aW5nLXN0YXJ0ZWRcIiwgbWF0Y2g6IFwiL2RvY3NcIiB9LFxuICAgIHtcbiAgICAgIHRleHQ6IHBrZy52ZXJzaW9uLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ2hhbmdlbG9nXCIsXG4gICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbW9vbndlbGwtZmkvbW9vbndlbGwtc2RrL2Jsb2IvbWFpbi9zcmMvQ0hBTkdFTE9HLm1kXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLFxuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL21vb253ZWxsLWZpL21vb253ZWxsLXNkay9ibG9iL21haW4vLmdpdGh1Yi9DT05UUklCVVRJTkcubWRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQG1vb253ZWxsLWZpL21vb253ZWxsLXNka1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiVHlwZVNjcmlwdCBJbnRlcmZhY2UgZm9yIE1vb253ZWxsXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuNS4xM1wiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJtYWluXCI6IFwiLi9fY2pzL2luZGV4LmpzXCIsXG4gIFwibW9kdWxlXCI6IFwiLi9fZXNtL2luZGV4LmpzXCIsXG4gIFwidHlwZXNcIjogXCIuL190eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwidHlwaW5nc1wiOiBcIi4vX3R5cGVzL2luZGV4LmQudHNcIixcbiAgXCJzaWRlRWZmZWN0c1wiOiBmYWxzZSxcbiAgXCJmaWxlc1wiOiBbXG4gICAgXCIqXCIsXG4gICAgXCIhKiovKi5iZW5jaC50c1wiLFxuICAgIFwiISoqLyouYmVuY2gtZC50c1wiLFxuICAgIFwiISoqLyoudGVzdC50c1wiLFxuICAgIFwiISoqLyoudGVzdC50cy5zbmFwXCIsXG4gICAgXCIhKiovKi50ZXN0LWQudHNcIixcbiAgICBcIiEqKi8qLnRzYnVpbGRpbmZvXCIsXG4gICAgXCIhdHNjb25maWcuYnVpbGQuanNvblwiLFxuICAgIFwiIWpzci5qc29uXCJcbiAgXSxcbiAgXCJleHBvcnRzXCI6IHtcbiAgICBcIi5cIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vX3R5cGVzL2luZGV4LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9fZXNtL2luZGV4LmpzXCIsXG4gICAgICBcImRlZmF1bHRcIjogXCIuL19janMvaW5kZXguanNcIlxuICAgIH0sXG4gICAgXCIuL2FjdGlvbnNcIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vX3R5cGVzL2FjdGlvbnMvaW5kZXguZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL19lc20vYWN0aW9ucy9pbmRleC5qc1wiLFxuICAgICAgXCJkZWZhdWx0XCI6IFwiLi9fY2pzL2FjdGlvbnMvaW5kZXguanNcIlxuICAgIH0sXG4gICAgXCIuL2NsaWVudFwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9fdHlwZXMvY2xpZW50L2luZGV4LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9fZXNtL2NsaWVudC9pbmRleC5qc1wiLFxuICAgICAgXCJkZWZhdWx0XCI6IFwiLi9fY2pzL2NsaWVudC9pbmRleC5qc1wiXG4gICAgfSxcbiAgICBcIi4vY29tbW9uXCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL190eXBlcy9jb21tb24vaW5kZXguZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL19lc20vY29tbW9uL2luZGV4LmpzXCIsXG4gICAgICBcImRlZmF1bHRcIjogXCIuL19janMvY29tbW9uL2luZGV4LmpzXCJcbiAgICB9LFxuICAgIFwiLi9lbnZpcm9ubWVudHNcIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vX3R5cGVzL2Vudmlyb25tZW50cy9pbmRleC5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vX2VzbS9lbnZpcm9ubWVudHMvaW5kZXguanNcIixcbiAgICAgIFwiZGVmYXVsdFwiOiBcIi4vX2Nqcy9lbnZpcm9ubWVudHMvaW5kZXguanNcIlxuICAgIH0sXG4gICAgXCIuL3BhY2thZ2UuanNvblwiOiBcIi4vcGFja2FnZS5qc29uXCJcbiAgfSxcbiAgXCJ0eXBlc1ZlcnNpb25zXCI6IHtcbiAgICBcIipcIjoge1xuICAgICAgXCJhY3Rpb25zXCI6IFtcIi4vX3R5cGVzL2FjdGlvbnMvaW5kZXguZC50c1wiXVxuICAgIH1cbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcInR5cGVzY3JpcHRcIjogXCI+PTUuMC40XCJcbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzTWV0YVwiOiB7XG4gICAgXCJ0eXBlc2NyaXB0XCI6IHtcbiAgICAgIFwib3B0aW9uYWxcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIl40LjE3LjlcIixcbiAgICBcImF4aW9zXCI6IFwiXjEuNy43XCIsXG4gICAgXCJkYXlqc1wiOiBcIl4xLjExLjEzXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwidmllbVwiOiBcIl4yLjIxLjE2XCJcbiAgfSxcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL21vb253ZWxsLmZpXCIsXG4gIFwicmVwb3NpdG9yeVwiOiBcIm1vb253ZWxsLWZpL21vb253ZWxsLXNka1wiLFxuICBcImF1dGhvcnNcIjogW1wieDBzMGwuZXRoXCJdLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImV0aFwiLFxuICAgIFwiZXRoZXJldW1cIixcbiAgICBcImRhcHBzXCIsXG4gICAgXCJzZGtcIixcbiAgICBcIm1vb253ZWxsXCIsXG4gICAgXCJ3ZWIzXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCJcbiAgXVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaGVucnkvTW9vbndlbGwvbW9vbndlbGwtc2RrL3NpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9oZW5yeS9Nb29ud2VsbC9tb29ud2VsbC1zZGsvc2l0ZS9zaWRlYmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9oZW5yeS9Nb29ud2VsbC9tb29ud2VsbC1zZGsvc2l0ZS9zaWRlYmFyLnRzXCI7aW1wb3J0IHR5cGUgeyBTaWRlYmFyIH0gZnJvbSBcInZvY3NcIjtcblxuZXhwb3J0IGNvbnN0IHNpZGViYXI6IFNpZGViYXIgPSB7XG4gIFwiL2RvY3MvXCI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkluc3RhbGxhdGlvblwiLCBsaW5rOiBcIi9kb2NzL2luc3RhbGxhdGlvblwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJHZXR0aW5nIFN0YXJ0ZWRcIiwgbGluazogXCIvZG9jcy9nZXR0aW5nLXN0YXJ0ZWRcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQWN0aW9uc1wiLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvcmVcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJNYXJrZXRzIEluZm9ybWF0aW9uXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcImdldE1hcmtldFwiLCBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRNYXJrZXRcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJnZXRNYXJrZXRzXCIsIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldE1hcmtldHNcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJVc2VyIFBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRVc2VyUG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2NvcmUvZ2V0VXNlclBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyQmFsYW5jZXNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9jb3JlL2dldFVzZXJCYWxhbmNlc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyUmV3YXJkXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRVc2VyUmV3YXJkXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFVzZXJSZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvY29yZS9nZXRVc2VyUmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1vcnBob1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIklzb2xhdGVkIE1hcmtldHNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob01hcmtldFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9NYXJrZXRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvTWFya2V0c1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9NYXJrZXRzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVmF1bHRzXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9WYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9WYXVsdFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9WYXVsdHNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9tb3JwaG8vZ2V0TW9ycGhvVmF1bHRzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVXNlciBQb3NpdGlvbnNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob01hcmtldFVzZXJQb3NpdGlvblwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9NYXJrZXRVc2VyUG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvTWFya2V0VXNlclBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9NYXJrZXRVc2VyUG9zaXRpb25zXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1ZhdWx0VXNlclBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob1ZhdWx0VXNlclBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1ZhdWx0VXNlclBvc2l0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9WYXVsdFVzZXJQb3NpdGlvbnNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0TW9ycGhvVXNlckJhbGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvbW9ycGhvL2dldE1vcnBob1VzZXJCYWxhbmNlc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRNb3JwaG9Vc2VyUmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL21vcnBoby9nZXRNb3JwaG9Vc2VyUmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdvdmVybmFuY2VcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTdGFraW5nXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRTdGFraW5nSW5mb1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0U3Rha2luZ0luZm9cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlclN0YWtpbmdJbmZvXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRVc2VyU3Rha2luZ0luZm9cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0R292ZXJuYW5jZVRva2VuSW5mb1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0R292ZXJuYW5jZVRva2VuSW5mb1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk9uY2hhaW4gUHJvcG9zYWxzXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRQcm9wb3NhbFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0UHJvcG9zYWxcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0UHJvcG9zYWxzXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTbmFwc2hvdCBQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFNuYXBzaG90UHJvcG9zYWxcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFNuYXBzaG90UHJvcG9zYWxcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0U25hcHNob3RQcm9wb3NhbHNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFNuYXBzaG90UHJvcG9zYWxzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRm9ydW1cIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldERlbGVnYXRlc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0RGVsZWdhdGVzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldERpc2N1c3Npb25zXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXREaXNjdXNzaW9uc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVzZXIgVm90ZXNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFVzZXJWb3RlUmVjZWlwdFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2dvdmVybmFuY2UvZ2V0VXNlclZvdGVSZWNlaXB0XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldFVzZXJWb3RpbmdQb3dlcnNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldFVzZXJWb3RpbmdQb3dlcnNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJIaXN0b3JpY2FsIERhdGFcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJnZXRNYXJrZXRTbmFwc2hvdHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZG9jcy9hY3Rpb25zL2NvcmUvZ2V0TWFya2V0U25hcHNob3RzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcImdldE1vcnBob1ZhdWx0U25hcHNob3RzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9tb3JwaG8vZ2V0TW9ycGhvVmF1bHRTbmFwc2hvdHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiZ2V0U3Rha2luZ1NuYXBzaG90c1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9kb2NzL2FjdGlvbnMvZ292ZXJuYW5jZS9nZXRTdGFraW5nU25hcHNob3RzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcImdldENpcmN1bGF0aW5nU3VwcGx5U25hcHNob3RzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2RvY3MvYWN0aW9ucy9nb3Zlcm5hbmNlL2dldENpcmN1bGF0aW5nU3VwcGx5U25hcHNob3RzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UyxTQUFTLG9CQUFvQjs7O0FDQXBVO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixhQUFlO0FBQUEsRUFDZixTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixNQUFRO0FBQUEsRUFDUixRQUFVO0FBQUEsRUFDVixPQUFTO0FBQUEsRUFDVCxTQUFXO0FBQUEsRUFDWCxhQUFlO0FBQUEsRUFDZixPQUFTO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJ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QUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixPQUFPO0FBQUEsZ0JBQ0w7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBRmxOQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsTUFDVCxPQUFPO0FBQUE7QUFBQTtBQUFBLFFBR0wsWUFBWSxFQUFFLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBS2hELGtCQUFrQixFQUFFLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFBQSxRQUN0RCx1QkFBdUIsRUFBRSxPQUFPLFdBQVcsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBWTNELGNBQWMsRUFBRSxPQUFPLFdBQVcsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBWWxELFlBQVksRUFBRSxPQUFPLFdBQVcsTUFBTSxVQUFVO0FBQUEsUUFDaEQsaUJBQWlCLEVBQUUsT0FBTyxXQUFXLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQW1EdkQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLEVBQ1QsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixFQUFFLE1BQU0sUUFBUSxNQUFNLHlCQUF5QixPQUFPLFFBQVE7QUFBQSxJQUM5RDtBQUFBLE1BQ0UsTUFBTSxnQkFBSTtBQUFBLE1BQ1YsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
