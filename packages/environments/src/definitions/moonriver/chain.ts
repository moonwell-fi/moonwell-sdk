import { defineChain } from "viem";
import { moonriver as viem_moonriver } from "viem/chains";
import type { Chain } from "../../types/chain.js";

export const moonriverChain = defineChain<{}, Chain>({
  ...viem_moonriver,
  rpcUrls: {
    private: {
      http: ["https://rpc.moonwell.fi/main/evm/1285", "https://rpc.api.moonriver.moonbeam.network", ...viem_moonriver.rpcUrls.default.http],
      webSocket: viem_moonriver.rpcUrls.default.webSocket,
    },
    default: viem_moonriver.rpcUrls.default,
  },
  custom: {},
});
