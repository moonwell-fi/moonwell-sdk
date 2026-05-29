import { createMarketConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const markets = createMarketConfig({
  tokens,
  markets: {
    MOONWELL_ETH: {
      marketToken: "MOONWELL_ETH",
      // Presented as native ETH to consumers — mirrors the Base / Optimism
      // convention where the on-chain underlying is WETH but the SDK config
      // says "ETH" so the frontend's mWETHRouter path can wrap on supply and
      // unwrap on withdraw. On-chain mToken.underlying() returns the WETH ERC-20.
      underlyingToken: "ETH",
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
