"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosition = void 0;
const common_js_1 = require("./common.js");
async function getUserPosition(params) {
    try {
        return (0, common_js_1.getUserPositionData)(params.environment, params.account);
    }
    catch (ex) {
        console.error("[getUserPosition] An error occured...", ex);
        return;
    }
}
exports.getUserPosition = getUserPosition;
//# sourceMappingURL=getUserPosition.js.map