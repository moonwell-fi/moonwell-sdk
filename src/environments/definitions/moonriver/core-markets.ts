import { createMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const markets = createMarketConfig({
  tokens,
  markets: {
    MOONWELL_MOVR: {
      marketToken: "MOONWELL_MOVR",
      underlyingToken: "MOVR",
    },
    MOONWELL_xcKSM: {
      marketToken: "MOONWELL_xcKSM",
      underlyingToken: "xcKSM",
    },
    MOONWELL_FRAX: {
      marketToken: "MOONWELL_FRAX",
      underlyingToken: "FRAX",
    },
    MOONWELL_BTC: {
      marketToken: "MOONWELL_BTC",
      underlyingToken: "BTC",
      deprecated: true,
    },
    MOONWELL_USDC: {
      marketToken: "MOONWELL_USDC",
      underlyingToken: "USDC",
      deprecated: true,
    },
    MOONWELL_ETH: {
      marketToken: "MOONWELL_ETH",
      underlyingToken: "ETH",
      deprecated: true,
    },
    MOONWELL_USDT: {
      marketToken: "MOONWELL_USDT",
      underlyingToken: "USDT",
      deprecated: true,
    },
  },
});
