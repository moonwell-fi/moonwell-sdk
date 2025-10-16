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
    MOONWELL_cbBTC: {
      marketToken: "MOONWELL_cbBTC",
      underlyingToken: "cbBTC",
    },
    MOONWELL_AERO: {
      marketToken: "MOONWELL_AERO",
      underlyingToken: "AERO",
    },
    MOONWELL_DAI: {
      marketToken: "MOONWELL_DAI",
      underlyingToken: "DAI",
    },
    MOONWELL_USDbC: {
      marketToken: "MOONWELL_USDbC",
      underlyingToken: "USDbC",
      deprecated: true,
    },
    MOONWELL_EURC: {
      marketToken: "MOONWELL_EURC",
      underlyingToken: "EURC",
    },
    MOONWELL_wrsETH: {
      marketToken: "MOONWELL_wrsETH",
      underlyingToken: "wrsETH",
    },
    MOONWELL_WELL: {
      marketToken: "MOONWELL_WELL",
      underlyingToken: "WELL",
    },
    MOONWELL_USDS: {
      marketToken: "MOONWELL_USDS",
      underlyingToken: "USDS",
    },
    MOONWELL_tBTC: {
      marketToken: "MOONWELL_tBTC",
      underlyingToken: "tBTC",
    },
    MOONWELL_LBTC: {
      marketToken: "MOONWELL_LBTC",
      underlyingToken: "LBTC",
    },
    MOONWELL_VIRTUAL: {
      marketToken: "MOONWELL_VIRTUAL",
      underlyingToken: "VIRTUAL",
    },
    MOONWELL_MORPHO: {
      marketToken: "MOONWELL_MORPHO",
      underlyingToken: "MORPHO",
    },
    MOONWELL_cbXRP: {
      marketToken: "MOONWELL_cbXRP",
      underlyingToken: "cbXRP",
    },
    MOONWELL_MAMO: {
      marketToken: "MOONWELL_MAMO",
      underlyingToken: "MAMO",
    },
  },
});
