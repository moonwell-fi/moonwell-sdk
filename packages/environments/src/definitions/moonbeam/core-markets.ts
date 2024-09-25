import { createMarketList } from "../../types/environment.js";
import { moonbeamTokenList } from "./tokens.js";

export const moonbeamMarketsList = createMarketList({
  tokens: moonbeamTokenList,
  markets: {
    MOONWELL_GLMR: {
      marketToken: "MOONWELL_GLMR",
      underlyingToken: "GLMR",
    },
    MOONWELL_xcDOT: {
      marketToken: "MOONWELL_xcDOT",
      underlyingToken: "xcDOT",
    },
    MOONWELL_FRAX: {
      marketToken: "MOONWELL_FRAX",
      underlyingToken: "FRAX",
    },
    MOONWELL_xcUSDC: {
      marketToken: "MOONWELL_xcUSDC",
      underlyingToken: "xcUSDC",
    },
    MOONWELL_xcUSDT: {
      marketToken: "MOONWELL_xcUSDT",
      underlyingToken: "xcUSDT",
    },
    MOONWELL_ETH: {
      marketToken: "MOONWELL_ETH",
      underlyingToken: "ETH",
    },
    MOONWELL_BTC: {
      marketToken: "MOONWELL_BTC",
      underlyingToken: "BTC",
    },
    MOONWELL_USDC: {
      marketToken: "MOONWELL_USDC",
      underlyingToken: "USDC",
    },
    MOONWELL_BUSD: {
      marketToken: "MOONWELL_BUSD",
      underlyingToken: "BUSD",
    },
  },
});
