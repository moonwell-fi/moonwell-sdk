import { base } from "viem/chains";
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
import { getMerklStakingApr } from "./common.js";

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

  const envStakingInfoSettlements = await Promise.allSettled(
    envsWithStaking.map(async (environment) => {
      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(environment.chainId),
        ) || environment;

      const isBase = environment.chainId === base.id;

      const promises = [
        environment.contracts.views?.read.getStakingInfo(),
        homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
        ...(isBase
          ? [
              environment.contracts.views?.read.getStakingInfo({
                blockNumber: BigInt(34149943),
              }),
            ]
          : []),
      ];

      const settlements = await Promise.allSettled(promises);
      return settlements.map((s) =>
        s.status === "fulfilled" ? s.value : undefined,
      );
    }),
  );

  const envStakingInfo = envStakingInfoSettlements
    .filter((s) => s.status === "fulfilled")
    .map(
      (s) =>
        (
          s as PromiseFulfilledResult<
            (
              | bigint
              | {
                  cooldown: bigint;
                  unstakeWindow: bigint;
                  distributionEnd: bigint;
                  totalSupply: bigint;
                  emissionPerSecond: bigint;
                  lastUpdateTimestamp: bigint;
                  index: bigint;
                }
              | undefined
            )[]
          >
        ).value,
    )
    .filter((val) => val !== undefined);

  const baseStakingApr = await getMerklStakingApr(
    "0xf2c5b7dd2d3416d3853bcf1e93c1cfdb7b5b5fda079d36408df02f731f7d1499",
  ); // merkl campaign id

  const result = envsWithStaking.flatMap((curr, index) => {
    const token =
      curr.config.tokens[
        curr.config.contracts.governanceToken as keyof TokensType<typeof curr>
      ]!;
    const stakingToken =
      curr.config.tokens[
        curr.config.contracts.stakingToken as keyof TokensType<typeof curr>
      ]!;

    const envStakingInfoData = envStakingInfo[index]![0]!;
    const envGovernanceTokenPriceData = envStakingInfo[index]![1]!;
    const envStakingInfoDataAfterX28Proposal = envStakingInfo[index]![2]!;
    const isBase = curr.chainId === base.id;

    if (
      !envStakingInfoData ||
      !envGovernanceTokenPriceData ||
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
    } = envStakingInfoData as {
      cooldown: bigint;
      distributionEnd: bigint;
      emissionPerSecond: bigint;
      totalSupply: bigint;
      unstakeWindow: bigint;
    };

    //Quick workaround to get governance token price from some other environment
    const governanceTokenPriceRaw = envGovernanceTokenPriceData;
    const governanceTokenPrice = new Amount(
      governanceTokenPriceRaw as bigint,
      18,
    );

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
