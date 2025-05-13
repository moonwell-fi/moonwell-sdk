import { createMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const markets = createMarketConfig({
  tokens,
  markets: {
    MOONWELL_USDC: {
      marketToken: "MOONWELL_USDC",
      underlyingToken: "USDC",
    },
    MOONWELL_ETH: {
      marketToken: "MOONWELL_ETH",
      underlyingToken: "ETH",
    },
    MOONWELL_cbETH: {
      marketToken: "MOONWELL_cbETH",
      underlyingToken: "cbETH",
    },
    MOONWELL_wstETH: {
      marketToken: "MOONWELL_wstETH",
      underlyingToken: "wstETH",
    },
    MOONWELL_rETH: {
      marketToken: "MOONWELL_rETH",
      underlyingToken: "rETH",
    },
    MOONWELL_weETH: {
      marketToken: "MOONWELL_weETH",
      underlyingToken: "weETH",
    },
    MOONWELL_WBTC: {
      marketToken: "MOONWELL_WBTC",
      underlyingToken: "WBTC",
    },
    MOONWELL_USDT: {
      marketToken: "MOONWELL_USDT",
      underlyingToken: "USDT",
    },
    MOONWELL_VELO: {
      marketToken: "MOONWELL_VELO",
      underlyingToken: "VELO",
    },
    MOONWELL_DAI: {
      marketToken: "MOONWELL_DAI",
      underlyingToken: "DAI",
    },
    MOONWELL_OP: {
      marketToken: "MOONWELL_OP",
      underlyingToken: "OP",
    },
    MOONWELL_wrsETH: {
      marketToken: "MOONWELL_wrsETH",
      underlyingToken: "wrsETH",
    },
    MOONWELL_USDT0: {
      marketToken: "MOONWELL_USDT0",
      underlyingToken: "USDT0",
    },
  },
});
