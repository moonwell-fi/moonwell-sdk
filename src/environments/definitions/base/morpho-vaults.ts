import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwETH: {
      underlyingToken: "ETH",
      vaultToken: "mwETH",
      campaignId:
        "0x40466bcdc554152818fd2c43a1433459f14861fac9ec8c9fb081c2e60d7fb7d2",
    },
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
      campaignId:
        "0x9a60452e6dc234f1ab53cf9f9b47a5068f7ecf6565e2d8948b8633e1d5758dc0",
    },
    mwEURC: {
      underlyingToken: "EURC",
      vaultToken: "mwEURC",
      campaignId:
        "0x4c356a498b51b736b33c9f58515b007215ffdd704d827d71065f2d80e54412e0",
    },
    mwcbBTC: {
      underlyingToken: "cbBTC",
      vaultToken: "mwcbBTC",
      campaignId:
        "0x1a009b7f9bf8c5efd590378a5b4bd866c678f5301ed83071c5e1147d8c68fc96",
    },
    meUSDC: {
      underlyingToken: "USDC",
      vaultToken: "meUSDC",
      campaignId:
        "0x0b50374399d7178dc2effdbbe098891c0ff7b57eba22e34393f54c4b4703e369",
    },
  },
});
