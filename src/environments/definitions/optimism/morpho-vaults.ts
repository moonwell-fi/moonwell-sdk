import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
    },
  },
});
