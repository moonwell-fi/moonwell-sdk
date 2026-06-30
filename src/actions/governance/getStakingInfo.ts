import { base } from "viem/chains";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  Amount,
  DAYS_PER_YEAR,
  SECONDS_PER_DAY,
  getEnvironmentsFromArgs,
} from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { Chain, Environment } from "../../environments/index.js";
import type { StakingInfo } from "../../types/staking.js";
import { getMerklStakingApr } from "./common.js";
import { getGovernanceTokenPriceFor } from "./getWellPrice.js";

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

const isStakingInfoStruct = (value: unknown): value is StakingInfoStruct => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.cooldown === "bigint" &&
    typeof v.distributionEnd === "bigint" &&
    typeof v.emissionPerSecond === "bigint" &&
    typeof v.totalSupply === "bigint" &&
    typeof v.unstakeWindow === "bigint"
  );
};

/**
 * Reads the staking fields directly from the stkWELL token contract when the
 * core views' getStakingInfo() is unavailable or returns zeroed data
 * (e.g. reverts on Moonbeam). Reads each field independently so a single
 * transient RPC failure doesn't erase the whole fallback.
 *
 * The `assets` mapping is keyed by the stkWELL contract's own address — that's
 * the Aave-fork convention (`address(this)` in StakedAave._initialize), not
 * the underlying staked token. Verified on Moonbeam: assets(stkWELL) returns
 * non-zero emissionPerSecond; assets(WELL) returns zero.
 */
async function getStakingInfoFromStkWell(
  environment: Environment,
): Promise<StakingInfoStruct | undefined> {
  const stakingToken = environment.contracts.stakingToken;
  const stakingTokenKey = environment.config.contracts.stakingToken;
  const tokens = environment.config.tokens as Record<
    string,
    { address: `0x${string}` } | undefined
  >;
  const stakingTokenAddress = stakingTokenKey
    ? tokens[stakingTokenKey]?.address
    : undefined;
  if (!stakingToken || !stakingTokenAddress) {
    environment.onError?.(
      new Error("getStakingInfoFromStkWell: missing stkWELL config"),
      { source: "staking-fallback", chainId: environment.chainId },
    );
    return undefined;
  }

  const [
    cooldownR,
    unstakeWindowR,
    distributionEndR,
    totalSupplyR,
    assetDataR,
  ] = await Promise.allSettled([
    stakingToken.read.COOLDOWN_SECONDS(),
    stakingToken.read.UNSTAKE_WINDOW(),
    stakingToken.read.DISTRIBUTION_END(),
    stakingToken.read.totalSupply(),
    stakingToken.read.assets([stakingTokenAddress]),
  ]);

  // Surface every rejection so operators don't have to guess which read failed.
  for (const r of [
    cooldownR,
    unstakeWindowR,
    distributionEndR,
    totalSupplyR,
    assetDataR,
  ]) {
    if (r.status === "rejected") {
      environment.onError?.(r.reason, {
        source: "staking-fallback",
        chainId: environment.chainId,
      });
    }
  }

  // totalSupply is load-bearing for APR; if its read failed (vs. legitimately
  // returning 0n on an empty new chain) we can't produce a sensible struct.
  if (totalSupplyR.status === "rejected") return undefined;

  const assetData =
    assetDataR.status === "fulfilled" ? assetDataR.value : undefined;
  // viem returns multi-output reads as a tuple (Readonly<[bigint, bigint, bigint]>)
  // even when the ABI names the outputs.
  const emissionPerSecond = assetData ? assetData[0] : 0n;

  return {
    cooldown: cooldownR.status === "fulfilled" ? cooldownR.value : 0n,
    unstakeWindow:
      unstakeWindowR.status === "fulfilled" ? unstakeWindowR.value : 0n,
    distributionEnd:
      distributionEndR.status === "fulfilled" ? distributionEndR.value : 0n,
    totalSupply: totalSupplyR.value,
    emissionPerSecond,
  };
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

  const baseEnvironment = (
    client.environments as { base?: Environment } | undefined
  )?.base;

  const envStakingInfoSettlements = await Promise.allSettled(
    envsWithStaking.map(async (environment) => {
      const isBase = environment.chainId === base.id;

      const [viewsStakingResult, historicalStakingResult, priceResult] =
        await Promise.allSettled([
          environment.contracts.views?.read.getStakingInfo(),
          isBase
            ? environment.contracts.views?.read.getStakingInfo({
                blockNumber: BigInt(34149943),
              })
            : Promise.resolve(undefined),
          getGovernanceTokenPriceFor(environment, baseEnvironment),
        ]);

      const viewsStaking =
        viewsStakingResult.status === "fulfilled"
          ? viewsStakingResult.value
          : undefined;

      // Fall back to direct stkWELL reads when the views call rejected (the
      // known Moonbeam failure mode) or returned a fully-zeroed struct
      // (suspicious — a real deployment always has cooldown and unstake
      // window configured > 0). A new chain with zero stakers but real
      // schedule constants still goes through views.
      const allZeroed =
        isStakingInfoStruct(viewsStaking) &&
        viewsStaking.cooldown === 0n &&
        viewsStaking.unstakeWindow === 0n &&
        viewsStaking.totalSupply === 0n &&
        viewsStaking.emissionPerSecond === 0n;
      const viewsValid = isStakingInfoStruct(viewsStaking) && !allZeroed;
      const stakingInfo: StakingInfoStruct | undefined = viewsValid
        ? viewsStaking
        : await getStakingInfoFromStkWell(environment);

      const historicalStaking =
        historicalStakingResult.status === "fulfilled"
          ? historicalStakingResult.value
          : undefined;

      const price = priceResult.status === "fulfilled" ? priceResult.value : 0n;

      if (priceResult.status === "rejected") {
        environment.onError?.(priceResult.reason, {
          source: "governance-token-price",
          chainId: environment.chainId,
        });
      }

      return { stakingInfo, historicalStaking, price };
    }),
  );

  const envStakingInfo = envStakingInfoSettlements.map((s) =>
    s.status === "fulfilled"
      ? s.value
      : { stakingInfo: undefined, historicalStaking: undefined, price: 0n },
  );

  const baseEnv = envsWithStaking.find((env) => env.chainId === base.id);
  const baseStakingTokenKey = baseEnv?.config.contracts.stakingToken;
  const baseTokens = baseEnv?.config.tokens as
    | Record<string, { address: `0x${string}` } | undefined>
    | undefined;
  const baseStkTokenAddress = baseStakingTokenKey
    ? baseTokens?.[baseStakingTokenKey]?.address
    : undefined;
  const baseStakingApr = baseStkTokenAddress
    ? await getMerklStakingApr(baseStkTokenAddress, baseEnv?.lunarIndexerUrl)
    : 0;

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

    // envStakingInfo is built via Promise.allSettled with an explicit
    // fallback object at the .map below, so entries are always defined here.
    const {
      stakingInfo: envStakingInfoData,
      historicalStaking,
      price,
    } = envStakingInfo[index];
    const isBase = curr.chainId === base.id;

    if (!envStakingInfoData || (isBase && !historicalStaking)) {
      return [];
    }

    const {
      cooldown,
      distributionEnd,
      emissionPerSecond: emissionPerSecondRaw,
      totalSupply: totalSupplyRaw,
      unstakeWindow,
    } = envStakingInfoData;

    const tokenPrice = new Amount(price, 18);
    const totalSupply = new Amount(totalSupplyRaw, 18);
    const emissionPerSecond = new Amount(emissionPerSecondRaw, 18);

    const emissionPerYear =
      emissionPerSecond.value * SECONDS_PER_DAY * DAYS_PER_YEAR;

    const apr =
      totalSupply.value > 0
        ? ((emissionPerYear + totalSupply.value) / totalSupply.value - 1) * 100
        : 0;

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
