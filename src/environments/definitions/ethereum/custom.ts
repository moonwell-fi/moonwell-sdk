import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  governance: {
    token: "WELL",
    // Empty: this field is also consumed as a `homeEnvironment` membership
    // predicate by core/markets/user-rewards (see src/actions/core/user-rewards/
    // common.ts:21). Listing Moonbeam here would mis-route Moonbeam's home env
    // to Ethereum.
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
