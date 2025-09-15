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
import { getMerklRewardsData } from "./common.js";

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
    envsWithStaking.map(async (environment) => {
      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(environment.chainId),
        ) || environment;

      const settled = await Promise.allSettled([
        environment.contracts.views?.read.getUserStakingInfo([userAddress]),
        environment.contracts.governanceToken?.read.balanceOf([userAddress]),
        homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
        environment.contracts.views?.read.getStakingInfo(),
      ]);

      return settled.map((s) =>
        s.status === "fulfilled" ? s.value : undefined,
      );
    }),
  );

  // merkl rewards by campaignId
  const merklRewards = await getMerklRewardsData(
    [
      "0xcd60ff26dc0b43f14c995c494bc5650087eaae68b279bdbe85e0e8eaa11fd513",
      "0xf2c5b7dd2d3416d3853bcf1e93c1cfdb7b5b5fda079d36408df02f731f7d1499",
    ],
    base.id,
    userAddress,
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

    // merkl rewards (only for base)
    const isBase = curr.chainId === base.id;
    const merklReward = merklRewards.reduce((acc, r) => {
      if (r.chain === curr.chainId) {
        return acc + BigInt(r.amount) - BigInt(r.claimed);
      }
      return acc;
    }, 0n);
    const merklPendingRewards = isBase ? merklReward : 0n;

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
        ? new Amount(merklPendingRewards, 18)
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
