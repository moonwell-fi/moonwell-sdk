import { zeroAddress } from "viem";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  ETH: {
    address: zeroAddress,
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  USDC: {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
});
