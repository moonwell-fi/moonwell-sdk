"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaults = void 0;
const config_js_1 = require("../../types/config.js");
const tokens_js_1 = require("./tokens.js");
exports.vaults = (0, config_js_1.createVaultConfig)({
    tokens: tokens_js_1.tokens,
    vaults: {
        mwETH: {
            underlyingToken: "ETH",
            vaultToken: "mwETH",
        },
        mwUSDC: {
            underlyingToken: "USDC",
            vaultToken: "mwUSDC",
        },
    },
});
//# sourceMappingURL=morpho-vaults.js.map