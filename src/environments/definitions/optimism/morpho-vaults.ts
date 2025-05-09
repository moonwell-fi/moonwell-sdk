import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
      multiReward: "0x2EED2b7d44E2cF64a41B6b3f78bE2Fdc56223d2B",
    },
  },
});
