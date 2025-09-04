import { type Address, zeroAddress } from "viem";
import { Amount } from "../../../common/index.js";
import {
  type Environment,
  publicEnvironments,
} from "../../../environments/index.js";
import {
  findMarketByAddress,
  findTokenByAddress,
} from "../../../environments/utils/index.js";
import type { UserReward } from "../../../types/userReward.js";

export const getUserRewardsData = async (params: {
  environment: Environment;
  account: Address;
  markets?: string[] | undefined;
}) => {
  const homeEnvironment =
    (Object.values(publicEnvironments) as Environment[]).find((e) =>
      e.custom?.governance?.chainIds?.includes(params.environment.chainId),
    ) || params.environment;

  const viewsContract = params.environment.contracts.views;
  const homeViewsContract = homeEnvironment.contracts.views;

  const [m0, r0, n0, g0] = await Promise.allSettled([
    viewsContract?.read.getAllMarketsInfo(),
    viewsContract?.read.getUserRewards([params.account]),
    homeViewsContract?.read.getNativeTokenPrice(),
    homeViewsContract?.read.getGovernanceTokenPrice(),
  ] as const);

  // Narrow each one by status and coerce to undefined on failure:
  const allMarkets = m0.status === "fulfilled" ? m0.value : undefined;

  const userRewards = r0.status === "fulfilled" ? r0.value : undefined;

  const nativeTokenPriceRaw = n0.status === "fulfilled" ? n0.value : undefined;

  const governanceTokenPriceRaw =
    g0.status === "fulfilled" ? g0.value : undefined;

  if (
    !allMarkets ||
    !userRewards ||
    !nativeTokenPriceRaw ||
    !governanceTokenPriceRaw
  ) {
    return [];
  }

  const governanceTokenPrice = new Amount(governanceTokenPriceRaw || 0n, 18);
  const nativeTokenPrice = new Amount(nativeTokenPriceRaw || 0n, 18);

  let tokenPrices =
    allMarkets
      ?.map((marketInfo) => {
        const marketFound = findMarketByAddress(
          params.environment,
          marketInfo.market,
        );
        if (marketFound) {
          return {
            token: marketFound.underlyingToken,
            tokenPrice: new Amount(
              marketInfo.underlyingPrice,
              36 - marketFound.underlyingToken.decimals,
            ),
          };
        } else {
          return;
        }
      })
      .filter((token) => !!token) || [];

  // Add governance token to token prices
  if (params.environment.custom?.governance?.token) {
    tokenPrices = [
      ...tokenPrices,
      {
        token:
          params.environment.config.tokens[
            params.environment.custom.governance.token
          ]!,
        tokenPrice: governanceTokenPrice,
      },
    ];
  }

  // Add native token to token prices
  tokenPrices = [
    ...tokenPrices,
    {
      token: findTokenByAddress(params.environment, zeroAddress)!,
      tokenPrice: nativeTokenPrice,
    },
  ];

  const markets = (allMarkets || []).filter((r) =>
    params.markets ? params.markets.includes(r.market) : true,
  );

  const rewards = markets.flatMap((marketInfo) => {
    const market = findMarketByAddress(params.environment, marketInfo.market);
    if (market) {
      const marketRewards =
        userRewards?.filter((r) => r.market === marketInfo.market) || [];

      return marketRewards
        .filter((reward) => {
          const token = findTokenByAddress(
            params.environment,
            reward.rewardToken,
          );
          return token !== undefined;
        })
        .map((reward) => {
          const token = findTokenByAddress(
            params.environment,
            reward.rewardToken,
          )!;

          const isGovernanceToken =
            token.symbol === params.environment.custom?.governance?.token;

          const isNativeToken = token.address === zeroAddress;

          const tokenPrice = tokenPrices?.find(
            (r) => r?.token.address === reward.rewardToken,
          )?.tokenPrice.value;

          const price =
            (isNativeToken
              ? nativeTokenPrice.value
              : isGovernanceToken
                ? governanceTokenPrice.value
                : tokenPrice) || 0;

          const supplyRewards = new Amount(
            reward.supplyRewardsAmount,
            token.decimals,
          );

          const borrowRewards = new Amount(
            reward.borrowRewardsAmount,
            token.decimals,
          );

          const result: UserReward = {
            chainId: params.environment.chainId,
            account: params.account,
            market: market.marketToken,
            rewardToken: token,
            supplyRewards,
            supplyRewardsUsd: supplyRewards.value * price,
            borrowRewards,
            borrowRewardsUsd: borrowRewards.value * price,
          };
          return result;
        });
    } else {
      return [];
    }
  });

  return rewards;
};
