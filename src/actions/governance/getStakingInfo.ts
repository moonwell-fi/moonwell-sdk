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
    .map((s) => s.value)
    .filter((val) => val !== undefined);

  console.log("sdk envStakingInfo", envStakingInfo);

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

    // Pending rewards after the X28 proposal (only for base)
    const {
      emissionPerSecond: emissionPerSecondRawAfterX28Proposal,
      totalSupply: totalSupplyRawAfterX28Proposal,
    } =
      isBase && envStakingInfoDataAfterX28Proposal
        ? (envStakingInfo[index]![2] as {
            cooldown: bigint;
            distributionEnd: bigint;
            emissionPerSecond: bigint;
            totalSupply: bigint;
            unstakeWindow: bigint;
          })
        : {
            emissionPerSecond: 0n,
            totalSupply: 0n,
          };

    const totalSupplyAfterX28Proposal = new Amount(
      totalSupplyRawAfterX28Proposal,
      18,
    );
    const emissionPerSecondAfterX28Proposal = new Amount(
      emissionPerSecondRawAfterX28Proposal,
      18,
    );

    const emissionPerYearAfterX28Proposal =
      emissionPerSecondAfterX28Proposal.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

    const aprAfterX28Proposal =
      ((emissionPerYearAfterX28Proposal + totalSupplyAfterX28Proposal.value) /
        totalSupplyAfterX28Proposal.value -
        1) *
      100;

    const totalSupply = new Amount(totalSupplyRaw, 18);
    const emissionPerSecond = new Amount(emissionPerSecondRaw, 18);

    const emissionPerYear =
      emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

    const apr =
      ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100;

    const stakingInfo: StakingInfo = {
      apr: isBase ? aprAfterX28Proposal : apr,
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
