"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGovernanceTokenInfo = void 0;
const index_js_1 = require("../../common/index.js");
const index_js_2 = require("../../environments/index.js");
async function getGovernanceTokenInfo(params) {
    if (params.governanceToken === "WELL") {
        const totalSupply = await index_js_2.publicEnvironments.moonbeam.contracts.governanceToken?.read.totalSupply();
        return {
            totalSupply: new index_js_1.Amount(totalSupply || 0n, 18),
        };
    }
    else {
        const totalSupply = await index_js_2.publicEnvironments.moonriver.contracts.governanceToken?.read.totalSupply();
        return {
            totalSupply: new index_js_1.Amount(totalSupply || 0n, 18),
        };
    }
}
exports.getGovernanceTokenInfo = getGovernanceTokenInfo;
//# sourceMappingURL=getGovernanceTokenInfo.js.map