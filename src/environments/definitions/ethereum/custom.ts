import { base, moonbeam, optimism } from "viem/chains";
import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  governance: {
    token: "WELL",
    // Satellite chains the Ethereum hub talks to via Wormhole: Moonbeam's
    // temporal governor (proposal execution) plus Base and Optimism's vote
    // collectors. Used by `getProposalsOnChainData` to enumerate per-chain
    // vote-collector reads when computing `votesCollected` for Ethereum-hub
    // proposals.
    chainIds: [moonbeam.id, base.id, optimism.id],
  },
  wormhole: {
    chainId: 2,
    tokenBridge: { address: "0x3ee18B2214AFF97000D974cf647E654bB5f1d8A8" },
  },
  xWELL: {
    bridgeAdapter: { address: "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7" },
  },
});
