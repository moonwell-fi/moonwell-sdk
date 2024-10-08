import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  Amount,
  DAYS_PER_YEAR,
  SECONDS_PER_DAY,
  getEnvironmentsFromArgs,
} from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import {
  type Chain,
  type Environment,
  type TokensType,
  publicEnvironments,
} from "../../environments/index.js";
import type { StakingInfo } from "../../types/staking.js";

export type GetStakingInfoParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network>;

export type GetStakingInfoReturnType = Promise<StakingInfo[]>;

export async function getStakingInfo<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetStakingInfoParameters<environments, Network>,
): GetStakingInfoReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const envsWithStaking = environments.filter(
    (env) => env.config.contracts.stakingToken,
  );

  const envStakingInfo = await Promise.all(
    envsWithStaking.map((environment) => {
      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(environment.chainId),
        ) || environment;

      return Promise.all([
        environment.contracts.views?.read.getStakingInfo(),
        homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
      ]);
    }),
  );

  const result = envsWithStaking.flatMap((curr, index) => {
    const token =
      curr.config.tokens[
        curr.config.contracts.governanceToken as keyof TokensType<typeof curr>
      ]!;
    const stakingToken =
      curr.config.tokens[
        curr.config.contracts.stakingToken as keyof TokensType<typeof curr>
      ]!;

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

    const emissionPerYear =
      emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

    const apr =
      ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100;

    const stakingInfo: StakingInfo = {
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

    return stakingInfo;
  });

  return result;
}
