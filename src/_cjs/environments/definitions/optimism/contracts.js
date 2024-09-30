"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.contracts = (0, config_js_1.createContractsConfig)({
    tokens: tokens_js_1.tokens,
    contracts: {
        governanceToken: "WELL",
        stakingToken: "stkWELL",
        wrappedNativeToken: "WETH",
        comptroller: "0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9",
        views: "0x821Ff3a967b39bcbE8A018a9b1563EAf878bad39",
        multiRewardDistributor: "0xF9524bfa18C19C3E605FbfE8DFd05C6e967574Aa",
        oracle: "0x2f1490bD6aD10C9CE42a2829afa13EAc0b746dcf",
        router: "0xc4Ab8C031717d7ecCCD653BE898e0f92410E11dC",
        temporalGovernor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
        voteCollector: "0x3C968481BE3ba1a99fed5f73dB2Ff51151037738",
    },
});
//# sourceMappingURL=contracts.js.map