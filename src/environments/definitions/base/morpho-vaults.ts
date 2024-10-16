import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwETH: {
      underlyingToken: "ETH",
      vaultToken: "mwETH",
    },
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
    },
    mwEURC: {
      underlyingToken: "EURC",
      vaultToken: "mwEURC",
    },
  },
});
