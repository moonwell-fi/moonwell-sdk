import { base, optimism } from "viem/chains";
import { createCustomConfig } from "../../types/config.js";
export const custom = createCustomConfig({
    governance: {
        token: "WELL",
        chainIds: [base.id, optimism.id],
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
//# sourceMappingURL=custom.js.map