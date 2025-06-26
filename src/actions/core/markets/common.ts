import { zeroAddress } from "viem";

import {
  Amount,
  DAYS_PER_YEAR,
  calculateApy,
  perDay,
} from "../../../common/index.js";

import { MOONWELL_FETCH_JSON_HEADERS } from "../../../common/fetch-headers.js";
import {
  type Environment,
  publicEnvironments,
} from "../../../environments/index.js";
import {
  findMarketByAddress,
  findTokenByAddress,
} from "../../../environments/utils/index.js";
import type { Market } from "../../../types/market.js";

export const getMarketsData = async (environment: Environment) => {
  const homeEnvironment =
    (Object.values(publicEnvironments) as Environment[]).find((e) =>
      e.custom?.governance?.chainIds?.includes(environment.chainId),
    ) || environment;

  const viewsContract = environment.contracts.views;
  const homeViewsContract = homeEnvironment.contracts.views;

  const marketData = await Promise.all([
    viewsContract?.read.getProtocolInfo(),
    viewsContract?.read.getAllMarketsInfo(),
    homeViewsContract?.read.getNativeTokenPrice(),
    homeViewsContract?.read.getGovernanceTokenPrice(),
  ]);

  const { seizePaused, transferPaused } = marketData[0]!;
  const allMarketsInfo = marketData[1]!;
  const nativeTokenPriceRaw = marketData[2]!;
  const governanceTokenPriceRaw = marketData[3]!;

  const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);
  const nativeTokenPrice = new Amount(nativeTokenPriceRaw, 18);

  const markets: Market[] = [];

  const tokenPrices = allMarketsInfo
    .map((marketInfo) => {
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

  for (const marketInfo of allMarketsInfo) {
    const marketFound = findMarketByAddress(environment, marketInfo.market);

    if (marketFound) {
      const { marketConfig, marketToken, underlyingToken, marketKey } =
        marketFound;

      let badDebt = new Amount(0n, underlyingToken.decimals);
      if (marketConfig.badDebt === true) {
        try {
          const badDebtResult =
            await environment.markets[marketKey]?.read.badDebt();
          badDebt = new Amount(badDebtResult, underlyingToken.decimals);
        } catch (error) {
          // ignore
        }
      }

      const supplyCaps = new Amount(
        marketInfo.supplyCap,
        underlyingToken.decimals,
      );
      const borrowCaps = new Amount(
        marketInfo.borrowCap,
        underlyingToken.decimals,
      );
      const collateralFactor = new Amount(marketInfo.collateralFactor, 18)
        .value;
      const underlyingPrice = new Amount(
        marketInfo.underlyingPrice,
        36 - underlyingToken.decimals,
      ).value;
      const marketTotalSupply = new Amount(
        marketInfo.totalSupply,
        marketToken.decimals,
      );
      const totalBorrows = new Amount(
        marketInfo.totalBorrows,
        underlyingToken.decimals,
      );
      const totalReserves = new Amount(
        marketInfo.totalReserves,
        underlyingToken.decimals,
      );
      const cash = new Amount(marketInfo.cash, underlyingToken.decimals);
      const exchangeRate = new Amount(
        marketInfo.exchangeRate,
        10 + underlyingToken.decimals,
      ).value;
      const reserveFactor = new Amount(marketInfo.reserveFactor, 18).value;
      const borrowRate = new Amount(marketInfo.borrowRate, 18);
      const supplyRate = new Amount(marketInfo.supplyRate, 18);
      const totalSupply = new Amount(
        marketTotalSupply.value * exchangeRate,
        underlyingToken.decimals,
      );

      const badDebtUsd = badDebt.value * underlyingPrice;
      const totalSupplyUsd = totalSupply.value * underlyingPrice;
      const totalBorrowsUsd = totalBorrows.value * underlyingPrice;
      const totalReservesUsd = totalReserves.value * underlyingPrice;
      const supplyCapsUsd = supplyCaps.value * underlyingPrice;
      const borrowCapsUsd = borrowCaps.value * underlyingPrice;

      const baseSupplyApy = calculateApy(supplyRate.value);
      const baseBorrowApy = calculateApy(borrowRate.value);

      const market: Market = {
        marketKey,
        chainId: environment.chainId,
        seizePaused,
        transferPaused,
        mintPaused: marketInfo.mintPaused,
        borrowPaused: marketInfo.borrowPaused,
        deprecated: marketConfig.deprecated === true,
        borrowCaps,
        borrowCapsUsd,
        cash,
        collateralFactor,
        exchangeRate,
        marketToken,
        reserveFactor,
        supplyCaps,
        supplyCapsUsd,
        badDebt,
        badDebtUsd,
        totalBorrows,
        totalBorrowsUsd,
        totalReserves,
        totalReservesUsd,
        totalSupply,
        totalSupplyUsd,
        underlyingPrice,
        underlyingToken,
        baseBorrowApy,
        baseSupplyApy,
        totalBorrowApr: 0,
        totalSupplyApr: 0,
        rewards: [],
      };

      for (const incentive of marketInfo.incentives) {
        let {
          borrowIncentivesPerSec,
          supplyIncentivesPerSec,
          token: tokenAddress,
        } = incentive;

        const token = findTokenByAddress(environment, tokenAddress);

        if (token) {
          const isGovernanceToken =
            token.symbol === environment.custom?.governance?.token;
          const isNativeToken = token.address === zeroAddress;
          const tokenPrice = tokenPrices.find(
            (r) => r?.token.address === incentive.token,
          )?.tokenPrice.value;
          const price = isNativeToken
            ? nativeTokenPrice.value
            : isGovernanceToken
              ? governanceTokenPrice.value
              : tokenPrice;

          if (price) {
            if (token.symbol === "USDC" && borrowIncentivesPerSec === 1n) {
              borrowIncentivesPerSec = 0n;
            }

            const supplyRewardsPerDayUsd =
              perDay(new Amount(supplyIncentivesPerSec, token.decimals).value) *
              price;
            const borrowRewardsPerDayUsd =
              perDay(new Amount(borrowIncentivesPerSec, token.decimals).value) *
              price;

            const supplyApr =
              totalSupplyUsd === 0
                ? 0
                : (supplyRewardsPerDayUsd / totalSupplyUsd) *
                  DAYS_PER_YEAR *
                  100;
            const borrowApr =
              totalBorrowsUsd === 0
                ? 0
                : (borrowRewardsPerDayUsd / totalBorrowsUsd) *
                  DAYS_PER_YEAR *
                  100 *
                  -1;

            market.rewards.push({
              liquidStakingApr: 0,
              borrowApr,
              supplyApr,
              token,
            });
          }
        }
      }

      market.totalSupplyApr = market.rewards.reduce(
        (prev, curr) => prev + curr.supplyApr,
        market.baseSupplyApy,
      );
      market.totalBorrowApr = market.rewards.reduce(
        (prev, curr) => prev + curr.borrowApr,
        market.baseBorrowApy,
      );

      markets.push(market);
    }
  }

  return markets;
};

const fetchFromGenericCacheApi = async <T>(uri: string): Promise<T> => {
  const response = await fetch(
    "https://generic-api-cache.moonwell.workers.dev/",
    {
      method: "POST",
      body: `{"uri":"${uri}","cacheDuration":"300"}`,
      headers: {
        ...MOONWELL_FETCH_JSON_HEADERS,
        "Content-Type": "text/plain",
      },
    },
  );

  return response.json() as T;
};

export const fetchLiquidStakingRewards = async () => {
  const result = {
    cbETH: 0,
    rETH: 0,
    wstETH: 0,
  };

  try {
    const cbETH = await fetchFromGenericCacheApi<{ apy: string }>(
      "https://api.exchange.coinbase.com/wrapped-assets/CBETH",
    );
    result.cbETH = Number(cbETH.apy) * 100;
  } catch (error) {
    result.cbETH = 0;
  }

  try {
    const rETH = await fetchFromGenericCacheApi<{ rethAPR: string }>(
      "https://rocketpool.net/api/mainnet/payload",
    );
    result.rETH = Number(rETH.rethAPR);
  } catch (error) {
    result.rETH = 0;
  }

  try {
    const stETH = await fetchFromGenericCacheApi<{ data: { apr: number } }>(
      "https://eth-api.lido.fi/v1/protocol/steth/apr/last",
    );
    result.wstETH = stETH.data.apr;
  } catch (error) {
    result.wstETH = 0;
  }

  return result;
};
