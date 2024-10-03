import { getMarketsData } from "./common.js";
export async function getMarkets(params) {
    const { environments } = params;
    const environmentsMarkets = await Promise.all(environments.map((environment) => getMarketsData(environment)));
    return environments.reduce((prev, curr, currIndex) => {
        return {
            ...prev,
            [curr.chainId]: environmentsMarkets[currIndex],
        };
    }, {});
}
//# sourceMappingURL=getMarkets.js.map