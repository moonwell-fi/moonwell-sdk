import type { Address } from "viem";
import { Amount } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import { findMarketByAddress } from "../../../environments/utils/index.js";
import type { UserPosition } from "../../../types/userPosition.js";

export const getUserPositionData = async (params: {
  environment: Environment;
  account: Address;
  markets?: string[] | undefined;
}) => {
  const viewsContract = params.environment.contracts.views;

  if (!viewsContract) {
    return [];
  }

  try {
    const [allMarkets, balances, borrows, memberships] = await Promise.all([
      viewsContract.read.getAllMarketsInfo(),
      viewsContract.read.getUserBalances([params.account]),
      viewsContract.read.getUserBorrowsBalances([params.account]),
      viewsContract.read.getUserMarketsMemberships([params.account]),
    ]);
    const markets = allMarkets
      ?.map((marketInfo) => {
        const market = findMarketByAddress(
          params.environment,
          marketInfo.market,
        );
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

          const result: UserPosition = {
            chainId: params.environment.chainId,
            account: params.account,
            market: market.marketToken,
            collateralEnabled: marketCollateralEnabled,
            borrowed,
            borrowedUsd,
            collateral,
            collateralUsd,
            supplied,
            suppliedUsd,
          };

          return result;
        } else {
          return;
        }
      })
      .filter((r) => r !== undefined)
      .filter((r) =>
        params.markets ? params.markets.includes(r!.market.address) : true,
      ) as UserPosition[];

    return markets;
  } catch {
    return [];
  }
};
