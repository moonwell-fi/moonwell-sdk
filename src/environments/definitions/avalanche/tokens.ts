import { zeroAddress } from "viem";
import { avalanche } from "viem/chains";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  AVAX: {
    address: zeroAddress,
    decimals: avalanche.nativeCurrency.decimals,
    name: avalanche.nativeCurrency.name,
    symbol: avalanche.nativeCurrency.symbol,
  },
  USDC: {
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
});
