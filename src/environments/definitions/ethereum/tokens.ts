import { zeroAddress } from "viem";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  ETH: {
    address: zeroAddress,
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  WETH: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
    name: "Wrapped Ethereum",
    symbol: "WETH",
  },
  USDC: {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
  USDT: {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    name: "Tether",
    symbol: "USDT",
  },
  cbBTC: {
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    decimals: 8,
    name: "Coinbase Bitcoin",
    symbol: "cbBTC",
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
  MOONWELL_ETH: {
    address: "0xb85ca1decc4971f8094da7676f8b71002a9590c4",
    decimals: 8,
    name: "Moonwell ETH",
    // On-chain `symbol()` is "mWETH"; presented as "mETH" to mirror the Base
    // convention where the same mToken type is surfaced as the native-ETH
    // market via the mWETHRouter.
    symbol: "mETH",
  },
  MOONWELL_USDC: {
    address: "0xe655790552c68f2871eb44b2cfe3dcfe6a63e62e",
    decimals: 8,
    name: "Moonwell USDC",
    symbol: "mUSDC",
  },
  MOONWELL_USDT: {
    address: "0xeddc25b67d474eeecfa4f69227b81d870c467011",
    decimals: 8,
    name: "Moonwell USDT",
    symbol: "mUSDT",
  },
  MOONWELL_cbBTC: {
    address: "0x636080eb65f1b665b646f47d31f21901cdaaee9f",
    decimals: 8,
    name: "Moonwell cbBTC",
    symbol: "mcbBTC",
  },
});
