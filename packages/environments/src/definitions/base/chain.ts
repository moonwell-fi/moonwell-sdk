import { defineChain } from "viem";
import { base as viemBaseChain } from "viem/chains";
import type { Chain } from "../../types/chain.js";

export const baseChain = defineChain<{}, Chain>({
  ...viemBaseChain,
  testnet: false,
  rpcUrls: {
    private: {
      http: [
        "https://rpc.moonwell.fi/main/evm/8453",
        "https://api.developer.coinbase.com/rpc/v1/base/JYfv6ozmwoiWJsIVQaTmrMuJYnpJgJBy",
        ...viemBaseChain.rpcUrls.default.http,
      ],
      webSocket: ["wss://base-mainnet.blastapi.io/745df601-de88-4079-8898-12f7e9688150"],
    },
    default: viemBaseChain.rpcUrls.default,
  },
  custom: {
    wormhole: {
      chainId: 30,
      tokenBridge: { address: "0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627" },
    },
    socket: {
      gateway: { address: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5" },
    },
    xWELL: {
      bridgeAdapter: { address: "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7" },
    },
  },
});
