import { Amount, DAYS_PER_YEAR, SECONDS_PER_DAY, } from "../../common/index.js";
import { publicEnvironments, } from "../../environments/index.js";
export async function getStakingInfo(params) {
    const envs = params.environments;
    const envsWithStaking = envs.filter((env) => env.config.contracts.stakingToken);
    try {
        const envStakingInfo = await Promise.all(envsWithStaking.map((environment) => {
            const homeEnvironment = Object.values(publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;
            return Promise.all([
                environment.contracts.views?.read.getStakingInfo(),
                homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
            ]);
        }));
        const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
            const token = curr.config.tokens[curr.config.contracts.governanceToken];
            const stakingToken = curr.config.tokens[curr.config.contracts.stakingToken];
            const { cooldown, distributionEnd, emissionPerSecond: emissionPerSecondRaw, totalSupply: totalSupplyRaw, unstakeWindow, } = envStakingInfo[index]?.[0];
            //Quick workaround to get governance token price from some other environment
            const governanceTokenPriceRaw = envStakingInfo[index]?.[1];
            const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);
            const totalSupply = new Amount(totalSupplyRaw, 18);
            const emissionPerSecond = new Amount(emissionPerSecondRaw, 18);
            const emissionPerYear = emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;
            const apr = ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100;
            const result = {
                apr,
                chainId: curr.chainId,
                cooldown: Number(cooldown),
                distributionEnd: Number(distributionEnd),
                token,
                tokenPrice: governanceTokenPrice.value,
                stakingToken,
                totalSupply,
                totalSupplyUSD: totalSupply.value * governanceTokenPrice.value,
                unstakeWindow: Number(unstakeWindow),
            };
            return {
                ...prev,
                [curr.chainId]: result,
            };
        }, {});
        return stakingInfo;
    }
    catch (ex) {
        console.error("An error occured while fetching staking info...", ex);
        return {};
    }
}
//# sourceMappingURL=getStakingInfo.js.map