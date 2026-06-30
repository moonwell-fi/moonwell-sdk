import type { Address, Chain } from "viem";
import { base } from "viem/chains";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Environment } from "../../environments/index.js";
import type { UserStakingInfo } from "../../types/staking.js";
import { getMerklCampaignIds, getMerklRewardsData } from "./common.js";
import { getGovernanceTokenPriceFor } from "./getWellPrice.js";

export type GetUserStakingInfoParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserStakingInfoReturnType = Promise<UserStakingInfo[]>;

type UserStakingFields = {
  cooldown: bigint;
  pendingRewards: bigint;
  totalStaked: bigint;
};

type StakingScheduleFields = {
  cooldown: bigint;
  unstakeWindow: bigint;
};

/**
 * Reads per-user staking fields directly from stkWELL when views.getUserStakingInfo()
 * is unavailable (e.g. reverts on Moonbeam).
 */
async function readUserStakingFromStkWell(
  environment: Environment,
  userAddress: Address,
): Promise<UserStakingFields | undefined> {
  const stakingToken = environment.contracts.stakingToken;
  if (!stakingToken) return undefined;

  const [cooldownR, rewardsR, balanceR] = await Promise.allSettled([
    stakingToken.read.stakersCooldowns([userAddress]),
    stakingToken.read.getTotalRewardsBalance([userAddress]),
    stakingToken.read.balanceOf([userAddress]),
  ]);

  // Surface every rejection so a single failed read (e.g. balanceOf throttled)
  // doesn't silently zero a field that the UI would then display as "no stake".
  for (const r of [cooldownR, rewardsR, balanceR]) {
    if (r.status === "rejected") {
      environment.onError?.(r.reason, {
        source: "user-staking-fallback",
        chainId: environment.chainId,
      });
    }
  }

  if (
    cooldownR.status === "rejected" &&
    rewardsR.status === "rejected" &&
    balanceR.status === "rejected"
  ) {
    return undefined;
  }

  return {
    cooldown: cooldownR.status === "fulfilled" ? cooldownR.value : 0n,
    pendingRewards: rewardsR.status === "fulfilled" ? rewardsR.value : 0n,
    totalStaked: balanceR.status === "fulfilled" ? balanceR.value : 0n,
  };
}

/**
 * Reads global cooldown/unstakeWindow constants from stkWELL when
 * views.getStakingInfo() is unavailable.
 */
async function readScheduleFromStkWell(
  environment: Environment,
): Promise<StakingScheduleFields | undefined> {
  const stakingToken = environment.contracts.stakingToken;
  if (!stakingToken) return undefined;

  const [cooldownR, unstakeWindowR] = await Promise.allSettled([
    stakingToken.read.COOLDOWN_SECONDS(),
    stakingToken.read.UNSTAKE_WINDOW(),
  ]);

  // Surface every rejection. A silent cooldown=0n would corrupt downstream
  // cooldownEnding math even if the unstakeWindow read succeeded.
  for (const r of [cooldownR, unstakeWindowR]) {
    if (r.status === "rejected") {
      environment.onError?.(r.reason, {
        source: "user-staking-schedule-fallback",
        chainId: environment.chainId,
      });
    }
  }

  if (cooldownR.status === "rejected" && unstakeWindowR.status === "rejected") {
    return undefined;
  }

  return {
    cooldown: cooldownR.status === "fulfilled" ? cooldownR.value : 0n,
    unstakeWindow:
      unstakeWindowR.status === "fulfilled" ? unstakeWindowR.value : 0n,
  };
}

const isUserStakingShape = (value: unknown): value is UserStakingFields => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.cooldown === "bigint" &&
    typeof v.pendingRewards === "bigint" &&
    typeof v.totalStaked === "bigint"
  );
};

const isScheduleShape = (value: unknown): value is StakingScheduleFields => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.cooldown === "bigint" && typeof v.unstakeWindow === "bigint";
};

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

  const baseEnvironment = (
    client.environments as { base?: Environment } | undefined
  )?.base;

  const envStakingInfo = await Promise.all(
    envsWithStaking.map(async (environment) => {
      const settled = await Promise.allSettled([
        environment.contracts.views?.read.getUserStakingInfo([userAddress]),
        environment.contracts.governanceToken?.read.balanceOf([userAddress]),
        environment.contracts.views?.read.getStakingInfo(),
        getGovernanceTokenPriceFor(environment, baseEnvironment),
      ]);

      const [userStakingR, balanceR, stakingScheduleR, priceR] = settled;

      const viewsUserStaking =
        userStakingR.status === "fulfilled" ? userStakingR.value : undefined;
      const userStaking = isUserStakingShape(viewsUserStaking)
        ? viewsUserStaking
        : await readUserStakingFromStkWell(environment, userAddress);

      const viewsSchedule =
        stakingScheduleR.status === "fulfilled"
          ? stakingScheduleR.value
          : undefined;
      const schedule = isScheduleShape(viewsSchedule)
        ? viewsSchedule
        : await readScheduleFromStkWell(environment);

      const tokenBalance =
        balanceR.status === "fulfilled" && balanceR.value !== undefined
          ? balanceR.value
          : 0n;

      const price = priceR.status === "fulfilled" ? priceR.value : 0n;
      if (priceR.status === "rejected") {
        environment.onError?.(priceR.reason, {
          source: "governance-token-price",
          chainId: environment.chainId,
        });
      }

      return { userStaking, schedule, tokenBalance, price };
    }),
  );

  const campaignIds = await getMerklCampaignIds(
    baseEnvironment?.lunarIndexerUrl,
  );
  const merklRewards = await getMerklRewardsData(
    campaignIds,
    base.id,
    userAddress,
    baseEnvironment?.lunarIndexerUrl,
  );

  const result = envsWithStaking.flatMap((curr, index) => {
    const govKey = curr.config.contracts.governanceToken;
    const stkKey = curr.config.contracts.stakingToken;
    const currTokens = curr.config.tokens as Record<
      string,
      { address: `0x${string}`; decimals: number; name: string; symbol: string }
    >;
    if (!govKey || !stkKey) return [];
    const token = currTokens[govKey];
    const stakingToken = currTokens[stkKey];
    if (!token || !stakingToken) return [];

    // envStakingInfo is built via Promise.all over the same envsWithStaking
    // array, so index access is always defined.
    const { userStaking, schedule, tokenBalance, price } =
      envStakingInfo[index];

    if (!userStaking || !schedule) return [];

    const { cooldown, pendingRewards, totalStaked } = userStaking;
    const { cooldown: cooldownSeconds, unstakeWindow } = schedule;

    const isBase = curr.chainId === base.id;
    const merklReward = merklRewards.reduce((acc, r) => {
      if (r.chain === curr.chainId) {
        return acc + BigInt(r.amount) - BigInt(r.claimed);
      }
      return acc;
    }, 0n);
    const merklPendingRewards = isBase ? merklReward : 0n;

    const cooldownEnding = cooldown > 0n ? cooldown + cooldownSeconds : 0n;
    const unstakingEnding =
      cooldown > 0n ? cooldown + cooldownSeconds + unstakeWindow : 0n;

    const tokenPrice = new Amount(price, 18);

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
      tokenPrice: tokenPrice.value,
      stakingToken,
      stakingTokenBalance: new Amount(totalStaked, 18),
    };

    return userStakingInfo;
  });

  return result;
}
