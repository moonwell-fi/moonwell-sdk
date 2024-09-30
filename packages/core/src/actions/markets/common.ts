import type { CoreMarket, Market } from "@/types/market.js";
import { calculateApy, findMarketByAddress, findTokenByAddress, perDay } from "@/utils/index.js";
import { Amount, DAYS_PER_YEAR } from "@moonwell-sdk/common";
import { type Environment, publicEnvironments } from "@moonwell-sdk/environments";
import { zeroAddress } from "viem";

export const getMarketsData = async (environment: Environment) => {
  const homeEnvironment =
    Object.values(publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;

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
          tokenPrice: new Amount(marketInfo.underlyingPrice, 36 - marketFound.underlyingToken.decimals),
        };
      } else {
        return;
      }
    })
    .filter((token) => !!token);

  for (const marketInfo of allMarketsInfo) {
    const marketFound = findMarketByAddress(environment, marketInfo.market);

    if (marketFound) {
      const { marketConfig, marketToken, underlyingToken } = marketFound;

      const supplyCaps = new Amount(marketInfo.supplyCap, underlyingToken.decimals);
      const borrowCaps = new Amount(marketInfo.borrowCap, underlyingToken.decimals);
      const collateralFactor = new Amount(marketInfo.collateralFactor, 18).value;
      const underlyingPrice = new Amount(marketInfo.underlyingPrice, 36 - underlyingToken.decimals).value;
      const marketTotalSupply = new Amount(marketInfo.totalSupply, marketToken.decimals);
      const totalBorrows = new Amount(marketInfo.totalBorrows, underlyingToken.decimals);
      const totalReserves = new Amount(marketInfo.totalReserves, underlyingToken.decimals);
      const cash = new Amount(marketInfo.cash, underlyingToken.decimals);
      const exchangeRate = new Amount(marketInfo.exchangeRate, 10 + underlyingToken.decimals).value;
      const reserveFactor = new Amount(marketInfo.reserveFactor, 18).value;
      const borrowRate = new Amount(marketInfo.borrowRate, 18);
      const supplyRate = new Amount(marketInfo.supplyRate, 18);
      const totalSupply = new Amount(marketTotalSupply.value * exchangeRate, underlyingToken.decimals);

      const totalSupplyUsd = totalSupply.value * underlyingPrice;
      const totalBorrowsUsd = totalBorrows.value * underlyingPrice;
      const totalReservesUsd = totalReserves.value * underlyingPrice;
      const supplyCapsUsd = supplyCaps.value * underlyingPrice;
      const borrowCapsUsd = borrowCaps.value * underlyingPrice;

      const baseSupplyApy = calculateApy(supplyRate.value);
      const baseBorrowApy = calculateApy(borrowRate.value);

      const market: Market = {
        chainId: environment.chainId,
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
        let { borrowIncentivesPerSec, supplyIncentivesPerSec, token: tokenAddress } = incentive;

        const token = findTokenByAddress(environment, tokenAddress);

        if (token) {
          const isGovernanceToken = token.symbol === environment.custom?.governance?.token;
          const isNativeToken = token.address === zeroAddress;
          const tokenPrice = tokenPrices.find((r) => r.token.address === incentive.token)?.tokenPrice.value;
          const price = isNativeToken ? nativeTokenPrice.value : isGovernanceToken ? governanceTokenPrice.value : tokenPrice;

          if (price) {
            if (token.symbol === "USDC" && borrowIncentivesPerSec === 1n) {
              borrowIncentivesPerSec = 0n;
            }

            const supplyRewardsPerDayUsd = perDay(new Amount(supplyIncentivesPerSec, token.decimals).value) * price;
            const borrowRewardsPerDayUsd = perDay(new Amount(borrowIncentivesPerSec, token.decimals).value) * price;

            const supplyApr = (supplyRewardsPerDayUsd / totalSupplyUsd) * DAYS_PER_YEAR * 100;
            const borrowApr = (borrowRewardsPerDayUsd / totalBorrowsUsd) * DAYS_PER_YEAR * 100;

            market.rewards.push({
              borrowApr,
              supplyApr,
              token,
            });
          }
        }
      }

      market.totalSupplyApr = market.rewards.reduce((prev, curr) => prev + curr.supplyApr, market.baseSupplyApy);
      market.totalBorrowApr = market.baseBorrowApy - market.rewards.reduce((prev, curr) => prev + curr.borrowApr, 0);

      markets.push(market);
    }
  }

  const totalSupplyUsd = markets.reduce((prev, curr) => prev + curr.totalSupplyUsd, 0);

  const totalBorrowsUsd = markets.reduce((prev, curr) => prev + curr.totalBorrowsUsd, 0);

  const result: CoreMarket = {
    chainId: environment.chainId,
    seizeGuardianPaused: seizePaused,
    transferGuardianPaused: transferPaused,
    markets,
    totalSupplyUsd,
    totalBorrowsUsd,
  };

  return result;
};
