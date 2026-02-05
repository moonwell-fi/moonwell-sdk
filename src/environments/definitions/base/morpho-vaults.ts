import { createVaultConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const vaults = createVaultConfig({
  tokens,
  vaults: {
    mwETH: {
      underlyingToken: "ETH",
      vaultToken: "mwETH",
      campaignId:
        "0x1df9a935f6b928b4809c4fda483f16839140864b2b412cc5fea85fd5d9d00e57",
    },
    mwUSDC: {
      underlyingToken: "USDC",
      vaultToken: "mwUSDC",
      campaignId:
        "0xec43a3d75ae25c5255eb06b3aac6b79ccb2cdb6b99740ea13553661b0f06b756",
    },
    mwEURC: {
      underlyingToken: "EURC",
      vaultToken: "mwEURC",
      campaignId:
        "0x03430078e052d58b6e80fa8e373c38a75736f1d24768b9c92a2e44bc4ce62b1d",
    },
    mwcbBTC: {
      underlyingToken: "cbBTC",
      vaultToken: "mwcbBTC",
      campaignId:
        "0xb230a09331c22280ae3e02a65caad21a553274912352d8f93c7a92c0f9bb3da4",
    },
    meUSDC: {
      underlyingToken: "USDC",
      vaultToken: "meUSDC",
      campaignId:
        "0x6738320fdf80785ff7a1d45ed93a6ffa07068ce9ec4170c1887d09f32fba7b57",
      version: 2,
    },
    meUSDCv1: {
      underlyingToken: "USDC",
      vaultToken: "meUSDCv1",
      campaignId:
        "0x6738320fdf80785ff7a1d45ed93a6ffa07068ce9ec4170c1887d09f32fba7b57",
    },
  },
});
