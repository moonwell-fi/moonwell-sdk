import { zeroAddress } from "viem";
import { polygon } from "viem/chains";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  [polygon.nativeCurrency.symbol]: {
    address: zeroAddress,
    decimals: polygon.nativeCurrency.decimals,
    name: polygon.nativeCurrency.name,
    symbol: polygon.nativeCurrency.symbol,
  },
  USDC: {
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
});
