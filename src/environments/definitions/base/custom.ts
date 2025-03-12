import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  morpho: {
    minimalDeployment: false,
    subgraphUrl:
      "https://api.goldsky.com/api/public/project_cm7wv7gztiq1e01vv7uco1h1y/subgraphs/moonwell-morpho-blue-base/production/gn",
  },
  governance: {
    token: "WELL",
    chainIds: [],
  },
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
});
