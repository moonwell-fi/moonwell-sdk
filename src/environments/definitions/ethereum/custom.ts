import { base, moonbeam, optimism } from "viem/chains";
import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  governance: {
    token: "WELL",
    // Satellite chains that relay votes back to Ethereum via Wormhole
    chainIds: [moonbeam.id, base.id, optimism.id],
    // TODO: Set to moonbeam.proposalCount + 1 at migration time (MIP-X45 execution)
    proposalIdOffset: 0,
    snapshotEnsName: "moonwell-governance.eth",
  },
  wormhole: {
    // Ethereum Wormhole chain ID = 2 (confirm with Solidity team)
    chainId: 2,
    // TODO: Replace with actual Ethereum Wormhole token bridge address
    tokenBridge: { address: "0x0000000000000000000000000000000000000005" },
  },
  socket: {
    // TODO: Confirm Socket gateway address for Ethereum mainnet
    gateway: { address: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5" },
  },
  xWELL: {
    // TODO: Replace with actual WormholeBridgeAdapter address on Ethereum (Step 0 complete, address TBD)
    bridgeAdapter: { address: "0x0000000000000000000000000000000000000006" },
  },
});
