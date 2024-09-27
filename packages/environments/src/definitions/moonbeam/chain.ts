import { moonbeam as viem_moonbeam } from "viem/chains";
import { createChain } from "../../types/chain.js";

export const moonbeam = createChain<typeof viem_moonbeam>({
  chain: viem_moonbeam,
  testnet: false,
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
