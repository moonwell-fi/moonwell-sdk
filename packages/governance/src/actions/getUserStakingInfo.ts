import type { UserStakingInfo } from "@/types/staking.js";
import { Amount, type MultichainReturnType } from "@moonwell-sdk/common";
import { environments } from "@moonwell-sdk/environments";
import type { Environment } from "../../../environments/src/types/environment.js";

export type GetUserStakingInfoReturnType = MultichainReturnType<UserStakingInfo>;

export async function getUserStakingInfo(params: {
  environments?: Environment[];
  account: `0x${string}`;
}): Promise<GetUserStakingInfoReturnType | undefined> {
  const envs = (params?.environments || environments) as Environment[];
  const envsWithStaking = envs.filter((env) => env.contracts.stakingToken);

  try {
    const envStakingInfo = await Promise.all(
      envsWithStaking.map((environment) => {
        const homeEnvironment = environments.find((e) => e.settings?.governance?.chainIds?.includes(environment.chain.id)) || environment;

        return Promise.all([
          environment.contracts.core?.views.read.getUserStakingInfo([params.account]),
          environment.contracts.governanceToken?.read.balanceOf([params.account]),
          homeEnvironment.contracts.core?.views.read.getGovernanceTokenPrice(),
          environment.contracts.core?.views.read.getStakingInfo(),
        ]);
      }),
    );

    const stakingInfo = envsWithStaking.reduce((prev, curr, index) => {
      const token = curr.tokens[curr.config.contracts.governanceToken!]!;
      const stakingToken = curr.tokens[curr.config.contracts.stakingToken!]!;

      const { cooldown, pendingRewards, totalStaked } = envStakingInfo[index]![0]!;

      const tokenBalance = envStakingInfo[index]![1]!;

      const governanceTokenPriceRaw = envStakingInfo[index]?.[2]!;

      const { cooldown: cooldownSeconds, unstakeWindow } = envStakingInfo[index]?.[3]!;

      const cooldownEnding = cooldown > 0n ? cooldown + cooldownSeconds : 0n;
      const unstakingEnding = cooldown > 0n ? cooldown + cooldownSeconds + unstakeWindow : 0n;

      const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);

      const result: UserStakingInfo = {
        chainId: curr.chain.id,
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
        [curr.chain.id]: result,
      };
    }, {} as GetUserStakingInfoReturnType);

    return stakingInfo;
  } catch (ex) {
    console.error("[getUserStakingInfo] An error occured...", ex);
    return {};
  }
}
