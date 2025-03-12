import { createMorphoMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const morphoMarkets = createMorphoMarketConfig({
  tokens,
  markets: {
    "ETH-USDC": {
      collateralToken: "ETH",
      loanToken: "USDC",
      id: "0x173b66359f0741b1c7f1963075cd271c739b6dc73b658e108a54ce6febeb279b",
    },
    "wstETH-USDC": {
      collateralToken: "wstETH",
      loanToken: "USDC",
      id: "0xc7ae57c1998c67a4c21804df606db1309b68a518ba5acc8b1dc3ffcb1b26b071",
    },
  },
});
