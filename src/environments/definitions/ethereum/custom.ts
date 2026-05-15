import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  // `governance.token: "WELL"` is what the frontend's xWELL bridge modal uses
  // to discover Ethereum as a WELL-holding chain. `chainIds` is left empty
  // because Ethereum is not yet the governance hub — that flip happens with
  // MIP-X56 and is covered by the broader migration plan.
  governance: {
    token: "WELL",
    chainIds: [],
  },
  wormhole: {
    chainId: 2,
  },
});
