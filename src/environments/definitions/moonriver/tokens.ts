import { zeroAddress } from "viem";
import { createTokenConfig } from "../../types/config.js";

export const tokens = createTokenConfig({
  MOVR: {
    address: zeroAddress,
    decimals: 18,
    name: "MOVR",
    symbol: "MOVR",
  },
  WMOVR: {
    address: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
    decimals: 18,
    name: "Wrapped MOVR",
    symbol: "MOVR",
  },
  MOONWELL_MOVR: {
    address: "0x6a1A771C7826596652daDC9145fEAaE62b1cd07f",
    decimals: 8,
    name: "Moonwell MOVR",
    symbol: "mMOVR",
  },
  xcKSM: {
    address: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
    decimals: 12,
    name: "Kusama",
    symbol: "xcKSM",
  },
  MOONWELL_xcKSM: {
    address: "0xa0D116513Bd0B8f3F14e6Ea41556c6Ec34688e0f",
    decimals: 8,
    name: "Moonwell xcKSM",
    symbol: "mxcKSM",
  },
  FRAX: {
    address: "0x1A93B23281CC1CDE4C4741353F3064709A16197d",
    decimals: 18,
    name: "Frax",
    symbol: "FRAX",
  },
  MOONWELL_FRAX: {
    address: "0x93Ef8B7c6171BaB1C0A51092B2c9da8dc2ba0e9D",
    decimals: 8,
    name: "Moonwell FRAX",
    symbol: "mFRAX",
  },
  BTC: {
    address: "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
    decimals: 8,
    name: "Bitcoin",
    symbol: "BTC",
  },
  MOONWELL_BTC: {
    address: "0x6E745367F4Ad2b3da7339aee65dC85d416614D90",
    decimals: 8,
    name: "Moonwell BTC",
    symbol: "mWBTC",
  },
  USDC: {
    address: "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D",
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
  MOONWELL_USDC: {
    address: "0xd0670AEe3698F66e2D4dAf071EB9c690d978BFA8",
    decimals: 8,
    name: "Moonwell USDC",
    symbol: "mUSDC",
  },
  ETH: {
    address: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C",
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  MOONWELL_ETH: {
    address: "0x6503D905338e2ebB550c9eC39Ced525b612E77aE",
    decimals: 8,
    name: "Moonwell ETH",
    symbol: "mETH",
  },
  USDT: {
    address: "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
    decimals: 6,
    name: "Tether",
    symbol: "USDT",
  },
  MOONWELL_USDT: {
    address: "0x36918B66F9A3eC7a59d0007D8458DB17bDffBF21",
    decimals: 8,
    name: "Moonwell USDT",
    symbol: "mUSDT",
  },
  MFAM: {
    address: "0xBb8d88bcD9749636BC4D2bE22aaC4Bb3B01A58F1",
    decimals: 18,
    name: "MFAM",
    symbol: "MFAM",
  },
  stkMFAM: {
    address: "0xCd76e63f3AbFA864c53b4B98F57c1aA6539FDa3a",
    decimals: 18,
    name: "stkMFAM",
    symbol: "stkMFAM",
  },
});
