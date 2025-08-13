import type { Address, Chain } from "viem";
import { base } from "viem/chains";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import {
  type Environment,
  type TokensType,
  publicEnvironments,
} from "../../environments/index.js";
import type { UserStakingInfo } from "../../types/staking.js";

export type GetUserStakingInfoParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
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

      const isBase = environment.chainId === base.id;

      const promises = [
        environment.contracts.views?.read.getUserStakingInfo([userAddress]),
        environment.contracts.governanceToken?.read.balanceOf([userAddress]),
        homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
        environment.contracts.views?.read.getStakingInfo(),
        ...(isBase
          ? [
              environment.contracts.views?.read.getUserStakingInfo(
                [userAddress],
                {
                  blockNumber: BigInt(34149941),
                },
              ),
            ]
          : []),
      ];

      return Promise.all(promises);
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

    const userStakingInfoData = envStakingInfo[index]![0]! as {
      cooldown: bigint;
      pendingRewards: bigint;
      totalStaked: bigint;
    };
    const { cooldown, pendingRewards, totalStaked } = userStakingInfoData;

    // Pending rewards before the X28 proposal (only for base)
    const isBase = curr.chainId === base.id;
    const pendingRewardsBeforeX28Proposal = isBase
      ? (envStakingInfo[index]![4] as { pendingRewards: bigint })
          ?.pendingRewards || 0n
      : 0n;

    const tokenBalance = envStakingInfo[index]![1]! as bigint;

    const governanceTokenPriceRaw = envStakingInfo[index]?.[2]! as bigint;

    const stakingInfoData = envStakingInfo[index]?.[3] as {
      cooldown: bigint;
      unstakeWindow: bigint;
    };
    const { cooldown: cooldownSeconds, unstakeWindow } = stakingInfoData;

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
      pendingRewards: isBase
        ? new Amount(pendingRewardsBeforeX28Proposal, 18)
        : new Amount(pendingRewards, 18),
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
