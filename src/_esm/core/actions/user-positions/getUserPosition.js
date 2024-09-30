import { getUserPositionData } from "./common.js";
export async function getUserPosition(params) {
    try {
        return getUserPositionData(params.environment, params.account);
    }
    catch (ex) {
        console.error("[getUserPosition] An error occured...", ex);
        return;
    }
}
//# sourceMappingURL=getUserPosition.js.map