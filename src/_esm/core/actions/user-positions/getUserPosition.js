import { getUserPositionData } from "./common.js";
export async function getUserPosition(params) {
    const userPosition = await getUserPositionData({ environment: params.environment, account: params.account, markets: [params.market] });
    return userPosition?.length > 0 ? userPosition[0] : undefined;
}
//# sourceMappingURL=getUserPosition.js.map