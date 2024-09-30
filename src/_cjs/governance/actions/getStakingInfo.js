"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStakingInfo = void 0;
const index_js_1 = require("../../common/index.js");
const index_js_2 = require("../../environments/index.js");
async function getStakingInfo(params) {
    const envs = params.environments;
    const envsWithStaking = envs.filter((env) => env.config.contracts.stakingToken);
    console.log(`envsWithStaking`, envsWithStaking);
    try {
        const envStakingInfo = await Promise.all(envsWithStaking.map((environment) => {
            const homeEnvironment = Object.values(index_js_2.publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;
            return Promise.all([
                environment.contracts.views?.read.getStakingInfo(),
                homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
            ]);
        }));
        const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
            const token = curr.config.tokens[curr.config.contracts.governanceToken];
            const stakingToken = curr.config.tokens[curr.config.contracts.stakingToken];
            const { cooldown, distributionEnd, emissionPerSecond: emissionPerSecondRaw, totalSupply: totalSupplyRaw, unstakeWindow, } = envStakingInfo[index]?.[0];
            const governanceTokenPriceRaw = envStakingInfo[index]?.[1];
            const governanceTokenPrice = new index_js_1.Amount(governanceTokenPriceRaw, 18);
            const totalSupply = new index_js_1.Amount(totalSupplyRaw, 18);
            const emissionPerSecond = new index_js_1.Amount(emissionPerSecondRaw, 18);
            const emissionPerYear = emissionPerSecond.value * index_js_1.SECONDS_PER_DAY * index_js_1.DAYS_PER_YEAR;
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
exports.getStakingInfo = getStakingInfo;
//# sourceMappingURL=getStakingInfo.js.map