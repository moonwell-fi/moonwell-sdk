"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.custom = void 0;
const chains_1 = require("viem/chains");
const config_js_1 = require("../../types/config.js");
exports.custom = (0, config_js_1.createCustomConfig)({
    governance: {
        token: "WELL",
        chainIds: [chains_1.base.id, chains_1.optimism.id],
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