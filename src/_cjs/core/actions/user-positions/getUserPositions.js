"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPositions = void 0;
const common_js_1 = require("./common.js");
async function getUserPositions(params) {
    const envs = params.environments;
    try {
        const environmentsUserPositions = await Promise.all(envs.map((environment) => {
            return (0, common_js_1.getUserPositionData)(environment, params.account);
        }));
        const userPositions = envs.reduce((prev, curr, index) => {
            const position = environmentsUserPositions[index];
            return {
                ...prev,
                [curr.chainId]: position,
            };
        }, {});
        return userPositions;
    }
    catch (ex) {
        console.error("[getUserPositions] An error occured...", ex);
        return {};
    }
}
exports.getUserPositions = getUserPositions;
//# sourceMappingURL=getUserPositions.js.map