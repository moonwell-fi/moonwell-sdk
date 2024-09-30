import { Amount, type MultichainReturnType } from "../../common/index.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";
import type { UserStakingInfo } from "../types/staking.js";

export type GetUserStakingInfoReturnType =
  MultichainReturnType<UserStakingInfo>;

export async function getUserStakingInfo(params: {
  environments: Environment[];
  account: `0x${string}`;
}): Promise<GetUserStakingInfoReturnType | undefined> {
  const envs = params.environments;
  const envsWithStaking = envs.filter((env) => env.contracts.stakingToken);

  try {
    const envStakingInfo = await Promise.all(
      envsWithStaking.map((environment) => {
        const homeEnvironment =
          (Object.values(publicEnvironments) as Environment[]).find((e) =>
            e.custom?.governance?.chainIds?.includes(environment.chainId),
          ) || environment;

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
      }),
    );

    const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
      const token =
        curr.config.tokens[curr.config.contracts.governanceToken as string]!;
      const stakingToken =
        curr.config.tokens[curr.config.contracts.stakingToken as string]!;

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

      const result: UserStakingInfo = {
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
    }, {} as GetUserStakingInfoReturnType);

    return stakingInfo;
  } catch (ex) {
    console.error("[getUserStakingInfo] An error occured...", ex);
    return {};
  }
}
