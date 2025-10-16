import { createMorphoMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const morphoMarkets = createMorphoMarketConfig({
  tokens,
  markets: {
    "wstETH-ETH": {
      collateralToken: "wstETH",
      loanToken: "ETH",
      id: "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba",
    },
    "USDC-ETH": {
      collateralToken: "USDC",
      loanToken: "ETH",
      id: "0x3b3769cfca57be2eaed03fcc5299c25691b77781a1e124e7a8d520eb9a7eabb5",
    },
    "cbETH-ETH": {
      collateralToken: "cbETH",
      loanToken: "ETH",
      id: "0x84662b4f95b85d6b082b68d32cf71bb565b3f22f216a65509cc2ede7dccdfe8c",
    },
    "rETH-ETH": {
      collateralToken: "rETH",
      loanToken: "ETH",
      id: "0xdc69cf2caae7b7d1783fb5a9576dc875888afad17ab3d1a3fc102f741441c165",
    },
    "cbETH-USDC": {
      collateralToken: "cbETH",
      loanToken: "USDC",
      id: "0x1C21C59DF9DB44BF6F645D854EE710A8CA17B479451447E9F56758AEE10A2FAD",
    },
    "ETH-USDC": {
      collateralToken: "ETH",
      loanToken: "USDC",
      id: "0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda",
    },
    "wstETH-USDC": {
      collateralToken: "wstETH",
      loanToken: "USDC",
      id: "0x13c42741a359ac4a8aa8287d2be109dcf28344484f91185f9a79bd5a805a55ae",
    },
    "wstETH-USDC-deprecated": {
      collateralToken: "wstETH",
      loanToken: "USDC",
      id: "0xa066f3893b780833699043f824e5bb88b8df039886f524f62b9a1ac83cb7f1f0",
      deprecated: true,
    },
    "rETH-USDC": {
      collateralToken: "rETH",
      loanToken: "USDC",
      id: "0xdb0bc9f10a174f29a345c5f30a719933f71ccea7a2a75a632a281929bba1b535",
    },
    "cbBTC-USDC": {
      collateralToken: "cbBTC",
      loanToken: "USDC",
      id: "0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836",
    },
    "cbBTC-ETH": {
      collateralToken: "cbBTC",
      loanToken: "ETH",
      id: "0x5dffffc7d75dc5abfa8dbe6fad9cbdadf6680cbe1428bafe661497520c84a94c",
    },
    "cbBTC-EURC": {
      collateralToken: "cbBTC",
      loanToken: "EURC",
      id: "0x67ebd84b2fb39e3bc5a13d97e4c07abe1ea617e40654826e9abce252e95f049e",
    },
    "PT_LBTC_29MAY2025-cbBTC": {
      collateralToken: "PT_LBTC_29MAY2025",
      loanToken: "cbBTC",
      id: "0x9a697eb760dd12aaea23699c96ea2ebbfe48b7af64138d92c4d232b9ed380024",
      deprecated: true,
    },
    "LBTC-cbBTC": {
      collateralToken: "LBTC",
      loanToken: "cbBTC",
      id: "0x4944a1169bc07b441473b830308ffe5bb535c10a9f824e33988b60738120c48e",
    },
    "WELL-USDC": {
      collateralToken: "WELL",
      loanToken: "USDC",
      id: "0x018ac6ef4385a1b13886c9170a6f3e0e968268ff2bf988f66512f45607aa38f7",
    },
    "MAMO-USDC": {
      collateralToken: "MAMO",
      loanToken: "USDC",
      id: "0xace0ea2ff0a6c4b7edc51fbce422be4cdbba45471e395d974c46d619aa2a393d",
    },
    "stkWELL-USDC": {
      collateralToken: "stkWELL",
      loanToken: "USDC",
      id: "0xb3920b96dec75b6a1144b71f963f30236fb200f3e33e93c2e9c0d222c1fa53c2",
    },
  },
});
