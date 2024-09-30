import { base, moonbeam, moonriver } from "viem/chains";
function createGovernanceTokensConfig(input) {
    return input;
}
export const GovernanceTokensConfig = createGovernanceTokensConfig({
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
        chainIds: [moonbeam.id, base.id],
        testnet: false,
    },
    MFAM: {
        id: "MFAM",
        symbol: "MFAM",
        name: "MFAM",
        chainIds: [moonriver.id],
        testnet: false,
    },
});
//# sourceMappingURL=governance.js.map