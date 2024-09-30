import { getMarketsData } from "./common.js";
export async function getMarkets(params) {
    const { environments } = params;
    const environmentsMarkets = await Promise.all(environments.map((environment) => getMarketsData(environment)));
    return environmentsMarkets.reduce((prev, curr) => {
        return {
            ...prev,
            [curr.chainId]: curr,
        };
    }, {});
}
//# sourceMappingURL=getMarkets.js.map