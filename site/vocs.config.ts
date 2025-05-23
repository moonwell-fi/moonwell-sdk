import { defineConfig } from "vocs";
import pkg from "../src/package.json";
import { sidebar } from "./sidebar";

export default defineConfig({
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
      text: pkg.version,
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
