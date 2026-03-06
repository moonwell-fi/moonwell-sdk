import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  governance: {
    token: "WELL",
    // Post MIP-X45: Moonbeam is no longer the governance home; it becomes a satellite chain.
    // Ethereum (mainnet) takes over as governance home with chainIds: [moonbeam, base, optimism].
    chainIds: [],
    proposalIdOffset: 79,
    snapshotEnsName: "moonwell-governance.eth",
  },
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
});
