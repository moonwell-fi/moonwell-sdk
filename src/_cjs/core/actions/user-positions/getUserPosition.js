"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosition = void 0;
const common_js_1 = require("./common.js");
async function getUserPosition(params) {
    const userPosition = await (0, common_js_1.getUserPositionData)({
        environment: params.environment,
        account: params.account,
        markets: [params.market],
    });
    return userPosition?.length > 0 ? userPosition[0] : undefined;
}
exports.getUserPosition = getUserPosition;
//# sourceMappingURL=getUserPosition.js.map