import { base as viem_baseChain } from "viem/chains";
import { createNetwork } from "../../types/network.js";

export const base = createNetwork<typeof viem_baseChain>({
  chain: viem_baseChain,
  testnet: false,
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
