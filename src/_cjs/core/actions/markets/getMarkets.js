"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkets = void 0;
const common_js_1 = require("./common.js");
async function getMarkets(params) {
    const { environments } = params;
    const environmentsMarkets = await Promise.all(environments.map((environment) => (0, common_js_1.getMarketsData)(environment)));
    return environments.reduce((prev, curr, currIndex) => {
        return {
            ...prev,
            [curr.chainId]: environmentsMarkets[currIndex],
        };
    }, {});
}
exports.getMarkets = getMarkets;
//# sourceMappingURL=getMarkets.js.map