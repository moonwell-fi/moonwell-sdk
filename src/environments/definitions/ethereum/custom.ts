import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  // chainIds: [] because Ethereum is currently a satellite (xWELL-holding only),
  // not the governance hub. When the hub migration lands, populate with the
  // satellite chain IDs (see moonbeam/custom.ts).
  governance: {
    token: "WELL",
    chainIds: [],
  },
  wormhole: {
    chainId: 2,
    tokenBridge: { address: "0x3ee18B2214AFF97000D974cf647E654bB5f1d8A8" },
  },
  xWELL: {
    bridgeAdapter: { address: "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7" },
  },
});
