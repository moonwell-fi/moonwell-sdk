import { getUserPositionData } from "./common.js";
export async function getUserPositions(params) {
    const envs = params.environments;
    const environmentsUserPositions = await Promise.all(envs.map((environment) => {
        return getUserPositionData({
            environment,
            account: params.account,
            markets: params.markets,
        });
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
//# sourceMappingURL=getUserPositions.js.map