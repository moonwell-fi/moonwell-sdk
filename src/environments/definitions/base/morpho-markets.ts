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
  },
});
