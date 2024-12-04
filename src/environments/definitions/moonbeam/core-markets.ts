import { createMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const markets = createMarketConfig({
  tokens,
  markets: {
    MOONWELL_GLMR: {
      marketToken: "MOONWELL_GLMR",
      underlyingToken: "GLMR",
    },
    MOONWELL_xcDOT: {
      marketToken: "MOONWELL_xcDOT",
      underlyingToken: "xcDOT",
      badDebt: true,
    },
    MOONWELL_FRAX: {
      marketToken: "MOONWELL_FRAX",
      underlyingToken: "FRAX",
      badDebt: true,
    },
    MOONWELL_xcUSDC: {
      marketToken: "MOONWELL_xcUSDC",
      underlyingToken: "xcUSDC",
    },
    MOONWELL_xcUSDT: {
      marketToken: "MOONWELL_xcUSDT",
      underlyingToken: "xcUSDT",
    },
    MOONWELL_ETH_NOMAD: {
      marketToken: "MOONWELL_ETH_NOMAD",
      underlyingToken: "ETH_NOMAD",
      deprecated: true,
    },
    MOONWELL_BTC_NOMAD: {
      marketToken: "MOONWELL_BTC_NOMAD",
      underlyingToken: "BTC_NOMAD",
      deprecated: true,
    },
    MOONWELL_USDC_NOMAD: {
      marketToken: "MOONWELL_USDC_NOMAD",
      underlyingToken: "USDC_NOMAD",
      deprecated: true,
    },
    MOONWELL_ETH_WORMHOLE: {
      marketToken: "MOONWELL_ETH_WORMHOLE",
      underlyingToken: "ETH_WORMHOLE",
    },
    MOONWELL_BTC_WORMHOLE: {
      marketToken: "MOONWELL_BTC_WORMHOLE",
      underlyingToken: "BTC_WORMHOLE",
    },
    MOONWELL_USDC_WORMHOLE: {
      marketToken: "MOONWELL_USDC_WORMHOLE",
      underlyingToken: "USDC_WORMHOLE",
    },
    MOONWELL_BUSD_WORMHOLE: {
      marketToken: "MOONWELL_BUSD_WORMHOLE",
      underlyingToken: "BUSD_WORMHOLE",
      deprecated: true,
    },
  },
});
