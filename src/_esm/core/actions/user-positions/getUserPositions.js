import { getUserPositionData } from "./common.js";
export async function getUserPositions(params) {
    const envs = params.environments;
    try {
        const environmentsUserPositions = await Promise.all(envs.map((environment) => {
            return getUserPositionData(environment, params.account);
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
//# sourceMappingURL=getUserPositions.js.map