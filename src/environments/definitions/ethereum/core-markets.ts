import { createMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const markets = createMarketConfig({
  tokens,
  markets: {
    MOONWELL_WETH: {
      marketToken: "MOONWELL_WETH",
      underlyingToken: "WETH",
    },
    MOONWELL_USDC: {
      marketToken: "MOONWELL_USDC",
      underlyingToken: "USDC",
    },
    MOONWELL_USDT: {
      marketToken: "MOONWELL_USDT",
      underlyingToken: "USDT",
    },
    MOONWELL_cbBTC: {
      marketToken: "MOONWELL_cbBTC",
      underlyingToken: "cbBTC",
    },
  },
});
