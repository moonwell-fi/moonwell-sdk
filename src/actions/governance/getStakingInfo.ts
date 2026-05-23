import { base } from "viem/chains";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  Amount,
  DAYS_PER_YEAR,
  SECONDS_PER_DAY,
  getEnvironmentsFromArgs,
} from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type {
  Chain,
  Environment,
  TokensType,
} from "../../environments/index.js";
import type { StakingInfo } from "../../types/staking.js";
import { getMerklStakingApr } from "./common.js";
import { getWellPriceFromBase } from "./getWellPrice.js";

export type GetStakingInfoParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network>;

export type GetStakingInfoReturnType = Promise<StakingInfo[]>;

type StakingInfoStruct = {
  cooldown: bigint;
  distributionEnd: bigint;
  emissionPerSecond: bigint;
  totalSupply: bigint;
  unstakeWindow: bigint;
};

/**
 * Reads the staking fields directly from the stkWELL token contract when the
 * core views' getStakingInfo() is unavailable (e.g. reverts on Moonbeam).
 * Returns undefined if any required read fails.
 */
async function getStakingInfoFromStkWell(
  environment: Environment,
): Promise<StakingInfoStruct | undefined> {
  const stakingToken = environment.contracts.stakingToken;
  const governanceTokenKey = environment.config.contracts.governanceToken as
    | keyof TokensType<typeof environment>
    | undefined;
  const governanceToken =
    governanceTokenKey != null
      ? environment.config.tokens[governanceTokenKey]
      : undefined;
  if (!stakingToken || !governanceToken) return undefined;

  try {
    const [cooldown, unstakeWindow, distributionEnd, totalSupply, assetData] =
      await Promise.all([
        stakingToken.read.COOLDOWN_SECONDS(),
        stakingToken.read.UNSTAKE_WINDOW(),
        stakingToken.read.DISTRIBUTION_END(),
        stakingToken.read.totalSupply(),
        stakingToken.read.assets([governanceToken.address]),
      ]);

    const [emissionPerSecond] = assetData as readonly [bigint, bigint, bigint];

    return {
      cooldown,
      unstakeWindow,
      distributionEnd,
      totalSupply,
      emissionPerSecond,
    };
  } catch {
    return undefined;
  }
}

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

  const governanceTokenPrice = await getWellPriceFromBase(client).catch(
    () => 0n,
  );

  const envStakingInfoSettlements = await Promise.allSettled(
    envsWithStaking.map(async (environment) => {
      const isBase = environment.chainId === base.id;

      const [viewsStakingResult, historicalStakingResult] =
        await Promise.allSettled([
          environment.contracts.views?.read.getStakingInfo(),
          isBase
            ? environment.contracts.views?.read.getStakingInfo({
                blockNumber: BigInt(34149943),
              })
            : Promise.resolve(undefined),
        ]);

      const viewsStaking =
        viewsStakingResult.status === "fulfilled"
          ? viewsStakingResult.value
          : undefined;

      const stakingInfo =
        viewsStaking ?? (await getStakingInfoFromStkWell(environment));

      const historicalStaking =
        historicalStakingResult.status === "fulfilled"
          ? historicalStakingResult.value
          : undefined;

      return [stakingInfo, historicalStaking];
    }),
  );

  const envStakingInfo = envStakingInfoSettlements.map((s) =>
    s.status === "fulfilled" ? s.value : [undefined, undefined],
  );

  const baseEnv = envsWithStaking.find((env) => env.chainId === base.id);
  const stakingTokenKey = baseEnv?.config.contracts.stakingToken;
  const baseStkToken =
    baseEnv != null && stakingTokenKey != null
      ? baseEnv.config.tokens[stakingTokenKey]
      : undefined;
  const baseStakingApr =
    baseStkToken != null ? await getMerklStakingApr(baseStkToken.address) : 0;

  const result = envsWithStaking.flatMap((curr, index) => {
    const token =
      curr.config.tokens[
        curr.config.contracts.governanceToken as keyof TokensType<typeof curr>
      ]!;
    const stakingToken =
      curr.config.tokens[
        curr.config.contracts.stakingToken as keyof TokensType<typeof curr>
      ]!;

    const envStakingInfoData = envStakingInfo[index]![0] as
      | StakingInfoStruct
      | undefined;
    const envStakingInfoDataAfterX28Proposal = envStakingInfo[index]![1];
    const isBase = curr.chainId === base.id;

    if (
      !envStakingInfoData ||
      (isBase && !envStakingInfoDataAfterX28Proposal)
    ) {
      return [];
    }

    const {
      cooldown,
      distributionEnd,
      emissionPerSecond: emissionPerSecondRaw,
      totalSupply: totalSupplyRaw,
      unstakeWindow,
    } = envStakingInfoData;

    const tokenPrice = new Amount(governanceTokenPrice, 18);

    const totalSupply = new Amount(totalSupplyRaw, 18);
    const emissionPerSecond = new Amount(emissionPerSecondRaw, 18);

    const emissionPerYear =
      emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

    const apr =
      ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100;

    const stakingInfo: StakingInfo = {
      apr: isBase ? baseStakingApr : apr,
      chainId: curr.chainId,
      cooldown: Number(cooldown),
      distributionEnd: Number(distributionEnd),
      token,
      tokenPrice: tokenPrice.value,
      stakingToken,
      totalSupply,
      totalSupplyUSD: totalSupply.value * tokenPrice.value,
      unstakeWindow: Number(unstakeWindow),
    };

    return stakingInfo;
  });

  return result;
}
