"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceTokensConfig = void 0;
const chains_1 = require("viem/chains");
function createGovernanceTokensConfig(input) {
    return input;
}
exports.GovernanceTokensConfig = createGovernanceTokensConfig({
    WELL_TESTNET: {
        id: "WELL_TESTNET",
        symbol: "WELL",
        name: "WELL (Testnet)",
        chainIds: [],
        testnet: true,
    },
    WELL: {
        id: "WELL",
        symbol: "WELL",
        name: "WELL",
        chainIds: [chains_1.moonbeam.id, chains_1.base.id],
        testnet: false,
    },
    MFAM: {
        id: "MFAM",
        symbol: "MFAM",
        name: "MFAM",
        chainIds: [chains_1.moonriver.id],
        testnet: false,
    },
});
//# sourceMappingURL=governance.js.map