import { createVaultList } from "../../types/environment.js";
import { baseTokenList } from "./tokens.js";

export const baseVaultList = createVaultList({
  tokens: baseTokenList,
  vaults: {
    mwETH: {
      underlyingToken: "ETH",
      vaultToken: "mwETH",
    },
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
    },
  },
});
