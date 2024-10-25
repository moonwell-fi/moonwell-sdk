import { zeroAddress } from "viem";
import { arbitrum } from "viem/chains";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  ETH: {
    address: zeroAddress,
    decimals: arbitrum.nativeCurrency.decimals,
    name: arbitrum.nativeCurrency.name,
    symbol: arbitrum.nativeCurrency.symbol,
  },
  USDC: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
});
