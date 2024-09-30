import { type Address, zeroAddress } from "viem";
import { Amount } from "../../../common/index.js";
import {
  type Environment,
  publicEnvironments,
} from "../../../environments/index.js";
import type {
  UserMarketPosition,
  UserMarketReward,
  UserPosition,
} from "../../types/userPosition.js";
import { findMarketByAddress, findTokenByAddress } from "../../utils/index.js";

export const getUserPositionData = async (
  environment: Environment,
  account: Address,
) => {
  const homeEnvironment =
    Object.values(publicEnvironments).find((e) =>
      e.custom?.governance?.chainIds?.includes(environment.chainId),
    ) || environment;

  const viewsContract = environment.contracts.views;
  const homeViewsContract = homeEnvironment.contracts.views;

  const userData = await Promise.all([
    viewsContract?.read.getAllMarketsInfo(),
    viewsContract?.read.getUserBalances([account]),
    viewsContract?.read.getUserBorrowsBalances([account]),
    viewsContract?.read.getUserMarketsMemberships([account]),
    viewsContract?.read.getUserRewards([account]),
    homeViewsContract?.read.getNativeTokenPrice(),
    homeViewsContract?.read.getGovernanceTokenPrice(),
  ]);

  const [
    allMarkets,
    balances,
    borrows,
    memberships,
    rewards,
    nativeTokenPriceRaw,
    governanceTokenPriceRaw,
  ] = userData;

  const governanceTokenPrice = new Amount(governanceTokenPriceRaw || 0n, 18);
  const nativeTokenPrice = new Amount(nativeTokenPriceRaw || 0n, 18);

  const tokenPrices = allMarkets
    ?.map((marketInfo) => {
      const marketFound = findMarketByAddress(environment, marketInfo.market);
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
    .filter((token) => !!token);

  const markets = allMarkets
    ?.map((marketInfo) => {
      const market = findMarketByAddress(environment, marketInfo.market);
      if (market) {
        const { marketToken, underlyingToken } = market;

        const underlyingPrice = new Amount(
          marketInfo.underlyingPrice,
          36 - underlyingToken.decimals,
        ).value;
        const collateralFactor = new Amount(marketInfo.collateralFactor, 18)
          .value;
        const exchangeRate = new Amount(
          marketInfo.exchangeRate,
          10 + underlyingToken.decimals,
        ).value;

        const marketCollateralEnabled =
          memberships?.find((r) => r.token === marketInfo.market)
            ?.membership === true;
        const marketBorrowedRaw =
          borrows?.find((r) => r.token === marketInfo.market)?.amount || 0n;
        const marketSuppliedRaw =
          balances?.find((r) => r.token === marketInfo.market)?.amount || 0n;
        const marketRewards =
          rewards?.filter((r) => r.market === marketInfo.market) || [];

        const borrowed = new Amount(
          marketBorrowedRaw,
          market.underlyingToken.decimals,
        );
        const borrowedUsd = borrowed.value * underlyingPrice;

        const marketSupplied = new Amount(
          marketSuppliedRaw,
          marketToken.decimals,
        );
        const supplied = new Amount(
          marketSupplied.value * exchangeRate,
          underlyingToken.decimals,
        );
        const suppliedUsd = supplied.value * underlyingPrice;

        const collateral = marketCollateralEnabled
          ? new Amount(
              supplied.value * collateralFactor,
              underlyingToken.decimals,
            )
          : new Amount(0n, underlyingToken.decimals);
        const collateralUsd = collateral.value * underlyingPrice;

        const result: UserMarketPosition = {
          chainId: environment.chainId,
          account,
          market: market.marketToken,
          collateralEnabled: marketCollateralEnabled,
          borrowed,
          borrowedUsd,
          collateral,
          collateralUsd,
          rewards: marketRewards
            .filter((reward) => {
              const token = findTokenByAddress(environment, reward.rewardToken);
              return token !== undefined;
            })
            .map((reward) => {
              const token = findTokenByAddress(
                environment,
                reward.rewardToken,
              )!;

              const isGovernanceToken =
                token.symbol === environment.custom?.governance?.token;
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

              const result: UserMarketReward = {
                chainId: environment.chainId,
                account,
                market: market.marketToken,
                rewardToken: token,
                supplyRewards,
                supplyRewardsUsd: supplyRewards.value * price,
                borrowRewards,
                borrowRewardsUsd: borrowRewards.value * price,
              };
              return result;
            }),
          supplied,
          suppliedUsd,
        };

        return result;
      } else {
        return;
      }
    })
    .filter((r) => r !== undefined) as UserMarketPosition[];

  const result: UserPosition = {
    account,
    chainId: environment.chainId,
    markets,
    totalBorrowedUsd: markets.reduce(
      (acc, market) => acc + market.borrowedUsd,
      0,
    ),
    totalSuppliedUsd: markets.reduce(
      (acc, market) => acc + market.suppliedUsd,
      0,
    ),
    totalCollateralUsd: markets.reduce(
      (acc, market) => acc + market.collateralUsd,
      0,
    ),
  };

  return result;
};
