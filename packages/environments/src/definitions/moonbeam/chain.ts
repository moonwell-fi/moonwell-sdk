import { defineChain } from "viem";
import { moonbeam as viem_moonbeam } from "viem/chains";
import type { Chain } from "../../types/chain.js";

export const moonbeamChain = defineChain<{}, Chain>({
  ...viem_moonbeam,
  rpcUrls: {
    private: {
      http: ["https://rpc.moonwell.fi/main/evm/1284", "https://rpc.api.moonbeam.network", ...viem_moonbeam.rpcUrls.default.http],
      webSocket: viem_moonbeam.rpcUrls.default.webSocket,
    },
    default: viem_moonbeam.rpcUrls.default,
  },
  custom: {
    wormhole: {
      chainId: 16,
      tokenBridge: { address: "0xB1731c586ca89a23809861c6103F0b96B3F57D92" },
    },
    socket: {
      gateway: { address: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5" },
    },
    xWELL: {
      bridgeAdapter: { address: "0xb84543e036054E2cD5394A9D99fa701Eef666df4" },
    },
  },
});
