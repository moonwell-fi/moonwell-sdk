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
    const [allMarketsResult, balancesResult, borrowsResult, membershipsResult] =
      await Promise.allSettled([
        viewsContract.read.getAllMarketsInfo(),
        viewsContract.read.getUserBalances([params.account]),
        viewsContract.read.getUserBorrowsBalances([params.account]),
        viewsContract.read.getUserMarketsMemberships([params.account]),
      ]);

    const balances =
      balancesResult.status === "fulfilled" ? balancesResult.value : [];
    const borrows =
      borrowsResult.status === "fulfilled" ? borrowsResult.value : [];
    const memberships =
      membershipsResult.status === "fulfilled" ? membershipsResult.value : [];

    // If getAllMarketsInfo failed (e.g. broken on-chain oracle), fall back to
    // per-mToken exchange rate calls. The user balance/borrow/membership calls
    // don't touch the oracle so they can still succeed.
    if (allMarketsResult.status === "rejected") {
      return getUserPositionsFromMTokenFallback(
        params,
        balances as { amount: bigint; token: `0x${string}` }[],
        borrows as { amount: bigint; token: `0x${string}` }[],
        memberships as { membership: boolean; token: `0x${string}` }[],
      );
    }

    const allMarkets = allMarketsResult.value;

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

/**
 * Fallback for chains whose on-chain price oracle is non-functional (e.g.
 * deprecated Moonriver). getUserBalances/getUserBorrowsBalances/getUserMarketsMemberships
 * don't require the oracle, so we use those results directly. We fetch each
 * mToken's exchangeRate individually to convert mToken balances to underlying.
 * All USD values are set to 0 since oracle prices are unavailable.
 */
async function getUserPositionsFromMTokenFallback(
  params: {
    environment: Environment;
    account: Address;
    markets?: string[] | undefined;
  },
  balances: { amount: bigint; token: `0x${string}` }[],
  borrows: { amount: bigint; token: `0x${string}` }[],
  memberships: { membership: boolean; token: `0x${string}` }[],
): Promise<UserPosition[]> {
  const positions: UserPosition[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envAny = params.environment as any;

  for (const marketKey of Object.keys(params.environment.config.markets)) {
    const marketConfig = envAny.config.markets[marketKey] as
      | { underlyingToken: string; marketToken: string }
      | undefined;
    if (!marketConfig) continue;

    const underlyingToken = envAny.config.tokens[
      marketConfig.underlyingToken
    ] as
      | {
          address: `0x${string}`;
          decimals: number;
          symbol: string;
          name: string;
        }
      | undefined;
    const marketToken = envAny.config.tokens[marketConfig.marketToken] as
      | {
          address: `0x${string}`;
          decimals: number;
          symbol: string;
          name: string;
        }
      | undefined;
    if (!underlyingToken || !marketToken) continue;

    const mTokenAddress = marketToken.address.toLowerCase() as `0x${string}`;

    const marketSuppliedRaw =
      balances.find((r) => r.token.toLowerCase() === mTokenAddress)?.amount ??
      0n;
    const marketBorrowedRaw =
      borrows.find((r) => r.token.toLowerCase() === mTokenAddress)?.amount ??
      0n;

    // Skip markets where the user has no position
    if (marketSuppliedRaw === 0n && marketBorrowedRaw === 0n) continue;

    const marketCollateralEnabled =
      memberships.find((r) => r.token.toLowerCase() === mTokenAddress)
        ?.membership === true;

    // Fetch exchange rate individually (not oracle-dependent)
    const mTokenContract = envAny.markets[marketKey] as
      | { read: Record<string, (...args: unknown[]) => Promise<bigint>> }
      | undefined;
    let exchangeRateRaw: bigint;
    try {
      exchangeRateRaw = (await mTokenContract?.read.exchangeRateStored()) ?? 0n;
    } catch {
      // Default to 1.0: 10^(10 + underlyingDecimals)
      exchangeRateRaw = 10n ** BigInt(10 + underlyingToken.decimals);
    }

    const exchangeRate = new Amount(
      exchangeRateRaw,
      10 + underlyingToken.decimals,
    ).value;

    const borrowed = new Amount(marketBorrowedRaw, underlyingToken.decimals);
    const marketSupplied = new Amount(marketSuppliedRaw, marketToken.decimals);
    const supplied = new Amount(
      marketSupplied.value * exchangeRate,
      underlyingToken.decimals,
    );

    if (params.markets && !params.markets.includes(marketToken.address)) {
      continue;
    }

    positions.push({
      chainId: params.environment.chainId,
      account: params.account,
      market: marketToken,
      collateralEnabled: marketCollateralEnabled,
      borrowed,
      borrowedUsd: 0,
      collateral: new Amount(0n, underlyingToken.decimals),
      collateralUsd: 0,
      supplied,
      suppliedUsd: 0,
    });
  }

  return positions;
}
