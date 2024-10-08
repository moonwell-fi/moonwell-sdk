import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import {
  type Environment,
  type TokensType,
  publicEnvironments,
} from "../../environments/index.js";
import type { UserStakingInfo } from "../../types/staking.js";

export type GetUserStakingInfoParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserStakingInfoReturnType = Promise<UserStakingInfo[]>;

export async function getUserStakingInfo<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserStakingInfoParameters<environments, Network>,
): GetUserStakingInfoReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  const envsWithStaking = environments.filter(
    (env) => env.contracts.stakingToken,
  );

  const envStakingInfo = await Promise.all(
    envsWithStaking.map((environment) => {
      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(environment.chainId),
        ) || environment;

      return Promise.all([
        environment.contracts.views?.read.getUserStakingInfo([userAddress]),
        environment.contracts.governanceToken?.read.balanceOf([userAddress]),
        homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
        environment.contracts.views?.read.getStakingInfo(),
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

    const { cooldown, pendingRewards, totalStaked } =
      envStakingInfo[index]![0]!;

    const tokenBalance = envStakingInfo[index]![1]!;

    const governanceTokenPriceRaw = envStakingInfo[index]?.[2]!;

    const { cooldown: cooldownSeconds, unstakeWindow } =
      envStakingInfo[index]?.[3]!;

    const cooldownEnding = cooldown > 0n ? cooldown + cooldownSeconds : 0n;
    const unstakingEnding =
      cooldown > 0n ? cooldown + cooldownSeconds + unstakeWindow : 0n;

    const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);

    const userStakingInfo: UserStakingInfo = {
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

    return userStakingInfo;
  });

  return result;
}
