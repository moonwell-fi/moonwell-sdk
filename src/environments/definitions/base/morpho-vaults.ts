import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwETH: {
      underlyingToken: "ETH",
      vaultToken: "mwETH",
      campaignId:
        "0x7b6fa69675c0b51216ad7701b382681883b8a7d6bc5e7ed2c53685bb6c689675",
    },
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
      campaignId:
        "0x50dbe3555f6c3b34bd4ced20cee841f35f7268e861fc80ceed1e56de1d4f0ddd",
    },
    mwEURC: {
      underlyingToken: "EURC",
      vaultToken: "mwEURC",
      campaignId:
        "0x9b6bff1f651d553966e15d1f3e29919cd47b03d2a35536dd8f60ca6e0bd9830b",
    },
    mwcbBTC: {
      underlyingToken: "cbBTC",
      vaultToken: "mwcbBTC",
    },
    meUSDC: {
      underlyingToken: "USDC",
      vaultToken: "meUSDC",
    },
  },
});
