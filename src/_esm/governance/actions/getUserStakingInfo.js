import { Amount } from "../../common/index.js";
import { publicEnvironments, } from "../../environments/index.js";
export async function getUserStakingInfo(params) {
    const envs = params.environments;
    const envsWithStaking = envs.filter((env) => env.contracts.stakingToken);
    try {
        const envStakingInfo = await Promise.all(envsWithStaking.map((environment) => {
            const homeEnvironment = Object.values(publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;
            return Promise.all([
                environment.contracts.views?.read.getUserStakingInfo([
                    params.account,
                ]),
                environment.contracts.governanceToken?.read.balanceOf([
                    params.account,
                ]),
                homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
                environment.contracts.views?.read.getStakingInfo(),
            ]);
        }));
        const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
            const token = curr.config.tokens[curr.config.contracts.governanceToken];
            const stakingToken = curr.config.tokens[curr.config.contracts.stakingToken];
            const { cooldown, pendingRewards, totalStaked } = envStakingInfo[index][0];
            const tokenBalance = envStakingInfo[index][1];
            const governanceTokenPriceRaw = envStakingInfo[index]?.[2];
            const { cooldown: cooldownSeconds, unstakeWindow } = envStakingInfo[index]?.[3];
            const cooldownEnding = cooldown > 0n ? cooldown + cooldownSeconds : 0n;
            const unstakingEnding = cooldown > 0n ? cooldown + cooldownSeconds + unstakeWindow : 0n;
            const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);
            const result = {
                chainId: curr.chainId,
                cooldownActive: cooldown > 0n,
                cooldownStart: Number(cooldown),
                cooldownEnding: Number(cooldownEnding),
                unstakingStart: Number(cooldownEnding),
                unstakingEnding: Number(unstakingEnding),
                pendingRewards: new Amount(pendingRewards, 18),
                token,
                tokenBalance: new Amount(tokenBalance, 18),
                tokenPrice: governanceTokenPrice.value,
                stakingToken,
                stakingTokenBalance: new Amount(totalStaked, 18),
            };
            return {
                ...prev,
                [curr.chainId]: result,
            };
        }, {});
        return stakingInfo;
    }
    catch (ex) {
        console.error("[getUserStakingInfo] An error occured...", ex);
        return {};
    }
}
//# sourceMappingURL=getUserStakingInfo.js.map