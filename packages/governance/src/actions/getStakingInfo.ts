import type { StakingInfo } from "@/types/staking.js";
import { Amount, DAYS_PER_YEAR, type MultichainReturnType, SECONDS_PER_DAY } from "@moonwell-sdk/common";
import { type Environment, publicEnvironments } from "@moonwell-sdk/environments";

export type GetStakingInfoType = MultichainReturnType<StakingInfo>;

export async function getStakingInfo(params: {
  environments: Environment[];
}): Promise<GetStakingInfoType> {
  const envs = params.environments;
  const envsWithStaking = envs.filter((env) => env.contracts.stakingToken);

  try {
    const envStakingInfo = await Promise.all(
      envsWithStaking.map((environment) => {
        const homeEnvironment =
          Object.values(publicEnvironments).find((e) => e.settings?.governance?.chainIds?.includes(environment.chain.id)) || environment;

        return Promise.all([
          environment.contracts.core?.views.read.getStakingInfo(),
          homeEnvironment.contracts.core?.views.read.getGovernanceTokenPrice(),
        ]);
      }),
    );

    const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
      const token = curr.tokens[curr.config.contracts.governanceToken!]!;
      const stakingToken = curr.tokens[curr.config.contracts.stakingToken!]!;

      const {
        cooldown,
        distributionEnd,
        emissionPerSecond: emissionPerSecondRaw,
        totalSupply: totalSupplyRaw,
        unstakeWindow,
      } = envStakingInfo[index]?.[0]!;

      //Quick workaround to get governance token price from some other environment
      const governanceTokenPriceRaw = envStakingInfo[index]?.[1]!;
      const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);

      const totalSupply = new Amount(totalSupplyRaw, 18);
      const emissionPerSecond = new Amount(emissionPerSecondRaw, 18);

      const emissionPerYear = emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

      const apr = ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100;

      const result: StakingInfo = {
        apr,
        chainId: curr.chain.id,
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
        [curr.chain.id]: result,
      };
    }, {} as GetStakingInfoType);

    return stakingInfo;
  } catch (ex) {
    console.error("An error occured while fetching staking info...", ex);
    return {};
  }
}
