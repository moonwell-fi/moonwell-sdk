"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.contracts = (0, config_js_1.createContractsConfig)({
    tokens: tokens_js_1.tokens,
    contracts: {
        governanceToken: "MFAM",
        stakingToken: "stkMFAM",
        wrappedNativeToken: "WMOVR",
        comptroller: "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E",
        views: "0xb4104C02BBf4E9be85AAa41a62974E4e28D59A33",
        oracle: "0x892bE716Dcf0A6199677F355f45ba8CC123BAF60",
        governor: "0x2BE2e230e89c59c8E20E633C524AD2De246e7370",
    },
});
//# sourceMappingURL=contracts.js.map