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
  WELL: {
    address: "0xA88594D404727625A9437C3f886C7643872296AE",
    decimals: 18,
    name: "Moonwell",
    symbol: "WELL",
  },
  stkWELL: {
    address: "0xb3a9E0DCf37658a48aa9f018C44f90378ddD4357",
    decimals: 18,
    name: "Moonwell Staked WELL",
    symbol: "stkWELL",
  },
});
