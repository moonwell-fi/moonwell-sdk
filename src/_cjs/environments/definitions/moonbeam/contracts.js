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
        wrappedNativeToken: "WGLMR",
        comptroller: "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
        views: "0xe76C8B8706faC85a8Fbdcac3C42e3E7823c73994",
        oracle: "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9",
        governor: "0xfc4DFB17101A12C5CEc5eeDd8E92B5b16557666d",
        multichainGovernor: "0x9A8464C4C11CeA17e191653Deb7CdC1bE30F1Af4",
    },
});
//# sourceMappingURL=contracts.js.map