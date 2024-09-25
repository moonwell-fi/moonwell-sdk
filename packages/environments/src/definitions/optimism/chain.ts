import { defineChain } from "viem";
import { optimism as viem_optimism } from "viem/chains";
import type { Chain } from "../../types/chain.js";

export const optimismChain = defineChain<{}, Chain>({
  ...viem_optimism,
  rpcUrls: {
    private: {
      http: ["https://rpc.moonwell.fi/main/evm/10", "https://optimism-rpc.publicnode.com", ...viem_optimism.rpcUrls.default.http],
      webSocket: ["wss://optimism-mainnet.blastapi.io/745df601-de88-4079-8898-12f7e9688150"],
    },
    default: viem_optimism.rpcUrls.default,
  },
  custom: {},
});
