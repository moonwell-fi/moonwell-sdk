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
  // Moonriver (chainId 1285) should always use on-chain data
  const isMoonriver = environment.chainId === 1285;

  if (environment.lunarIndexerUrl && !isMoonriver) {
    try {
      const result = await fetchMarketsFromLunar(environment);
      return result;
    } catch (error) {
      // Import shouldFallback dynamically
      const { shouldFallback } = await import("../../lunar-indexer-client.js");

      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug("[Lunar fallback] Falling back to RPC/Ponder:", error);
    }
  }

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
            // USDC on-chain returns borrowIncentivesPerSec=1 (1 wei) as a
            // placeholder when there are no active borrow incentives. Treat as zero.
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
            // Negative: borrow reward APR reduces the effective borrowing cost
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

/**
 * Fetch markets data from Lunar Indexer (hybrid approach)
 *
 * Uses Lunar for core market data and conditionally:
 * - If Lunar provides priceUsd/supplyApr/borrowApr in incentives: use those (NO RPC calls)
 * - If Lunar fields are null: fetch governance/native token prices for reward APR calculations (RPC calls)
 * - Always fetch liquid staking APRs from external APIs
 */
async function fetchMarketsFromLunar(
  environment: Environment,
): Promise<Market[]> {
  if (!environment.lunarIndexerUrl) {
    throw new Error("Lunar Indexer URL not configured");
  }

  // Import client dynamically to avoid circular dependencies
  const { createLunarIndexerClient, DEFAULT_LUNAR_TIMEOUT_MS } = await import(
    "../../lunar-indexer-client.js"
  );

  const client = createLunarIndexerClient({
    baseUrl: environment.lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const lunarMarketsResponse = await client.listMarkets(environment.chainId);
  const lunarMarkets = lunarMarketsResponse.results;

  const needsRpcPrices = lunarMarkets.some((market) =>
    market.incentives.some(
      (incentive) =>
        incentive.priceUsd === null ||
        incentive.supplyApr === null ||
        incentive.borrowApr === null,
    ),
  );

  let governanceTokenPrice: Amount | undefined;
  let nativeTokenPrice: Amount | undefined;

  if (needsRpcPrices) {
    const homeEnvironment =
      (Object.values(publicEnvironments) as Environment[]).find((e) =>
        e.custom?.governance?.chainIds?.includes(environment.chainId),
      ) || environment;

    const [nativeTokenPriceRaw, governanceTokenPriceRaw] = await Promise.all([
      homeEnvironment.contracts.views?.read.getNativeTokenPrice(),
      homeEnvironment.contracts.views?.read.getGovernanceTokenPrice(),
    ]);

    if (!nativeTokenPriceRaw || !governanceTokenPriceRaw) {
      throw new Error(
        "Failed to fetch native or governance token prices from home chain",
      );
    }

    governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);
    nativeTokenPrice = new Amount(nativeTokenPriceRaw, 18);
  }

  const markets: Market[] = [];

  for (const lunarMarket of lunarMarkets) {
    const marketFound = findMarketByAddress(
      environment,
      lunarMarket.address as `0x${string}`,
    );

    if (!marketFound) {
      continue;
    }

    const { marketConfig, marketToken, underlyingToken, marketKey } =
      marketFound;

    // Transform Lunar decimal numbers to SDK Amount types
    // Note: Number() wrapping is defensive — the Lunar API may return numeric
    // fields as strings, which would break BigInt conversion via Math.floor.
    const totalSupply = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.totalSupply) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    const totalBorrows = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.totalBorrows) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    const totalReserves = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.totalReserves) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    const cash = new Amount(
      BigInt(
        Math.floor(Number(lunarMarket.cash) * 10 ** underlyingToken.decimals),
      ),
      underlyingToken.decimals,
    );

    const badDebt = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.badDebt) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    const supplyCaps = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.supplyCap) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    const borrowCaps = new Amount(
      BigInt(
        Math.floor(
          Number(lunarMarket.borrowCap) * 10 ** underlyingToken.decimals,
        ),
      ),
      underlyingToken.decimals,
    );

    // Lunar provides reserveFactor as wei string, convert to decimal
    const reserveFactor = new Amount(BigInt(lunarMarket.reserveFactor), 18)
      .value;

    const market: Market = {
      marketKey,
      chainId: environment.chainId,
      seizePaused: lunarMarket.seizePaused,
      transferPaused: lunarMarket.transferPaused,
      mintPaused: lunarMarket.mintPaused,
      borrowPaused: lunarMarket.borrowPaused,
      deprecated: marketConfig.deprecated === true,
      borrowCaps,
      borrowCapsUsd:
        Number(lunarMarket.borrowCap) * Number(lunarMarket.priceUsd),
      cash,
      collateralFactor: Number(lunarMarket.collateralFactor),
      exchangeRate: Number(lunarMarket.exchangeRate),
      marketToken,
      reserveFactor,
      supplyCaps,
      supplyCapsUsd:
        Number(lunarMarket.supplyCap) * Number(lunarMarket.priceUsd),
      badDebt,
      badDebtUsd: Number(lunarMarket.badDebtUsd),
      totalBorrows,
      totalBorrowsUsd: Number(lunarMarket.totalBorrowsUsd),
      totalReserves,
      totalReservesUsd: Number(lunarMarket.totalReservesUsd),
      totalSupply,
      totalSupplyUsd: Number(lunarMarket.totalSupplyUsd),
      underlyingPrice: Number(lunarMarket.priceUsd),
      underlyingToken,
      baseBorrowApy: Number(lunarMarket.baseBorrowApy),
      baseSupplyApy: Number(lunarMarket.baseSupplyApy),
      totalBorrowApr: 0,
      totalSupplyApr: 0,
      rewards: [],
    };

    for (const incentive of lunarMarket.incentives) {
      const token = findTokenByAddress(
        environment,
        incentive.token as `0x${string}`,
      );
      if (!token) {
        continue;
      }

      let supplyApr: number;
      let borrowApr: number;

      if (
        incentive.priceUsd !== null &&
        incentive.supplyApr !== null &&
        incentive.borrowApr !== null
      ) {
        supplyApr = Number(incentive.supplyApr);
        borrowApr = Number(incentive.borrowApr);
      } else {
        const isGovernanceToken =
          token.symbol === environment.custom?.governance?.token;
        const isNativeToken = token.address === zeroAddress;

        const price = isNativeToken
          ? nativeTokenPrice?.value
          : isGovernanceToken
            ? governanceTokenPrice?.value
            : undefined;

        if (!price) {
          continue;
        }

        let borrowIncentivesPerSec = BigInt(incentive.borrowIncentivesPerSec);
        const supplyIncentivesPerSec = BigInt(incentive.supplyIncentivesPerSec);

        // USDC on-chain returns borrowIncentivesPerSec=1 (1 wei) as a
        // placeholder when there are no active borrow incentives. Treat as zero.
        if (token.symbol === "USDC" && borrowIncentivesPerSec === 1n) {
          borrowIncentivesPerSec = 0n;
        }

        const supplyRewardsPerDayUsd =
          perDay(new Amount(supplyIncentivesPerSec, token.decimals).value) *
          price;
        const borrowRewardsPerDayUsd =
          perDay(new Amount(borrowIncentivesPerSec, token.decimals).value) *
          price;

        supplyApr =
          Number(lunarMarket.totalSupplyUsd) === 0
            ? 0
            : (supplyRewardsPerDayUsd / Number(lunarMarket.totalSupplyUsd)) *
              DAYS_PER_YEAR *
              100;
        // Negative: borrow reward APR reduces the effective borrowing cost
        borrowApr =
          Number(lunarMarket.totalBorrowsUsd) === 0
            ? 0
            : (borrowRewardsPerDayUsd / Number(lunarMarket.totalBorrowsUsd)) *
              DAYS_PER_YEAR *
              100 *
              -1;
      }

      market.rewards.push({
        liquidStakingApr: 0,
        borrowApr,
        supplyApr,
        token,
      });
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

  // Still fetch liquid staking rewards from external APIs
  const liquidStakingRewards = await fetchLiquidStakingRewards();

  for (const market of markets) {
    const symbol = market.underlyingToken.symbol;
    if (symbol in liquidStakingRewards) {
      const liquidStakingApr =
        liquidStakingRewards[symbol as keyof typeof liquidStakingRewards];

      market.rewards.push({
        token: market.underlyingToken,
        supplyApr: liquidStakingApr,
        borrowApr: 0,
        liquidStakingApr,
      });

      market.totalSupplyApr += liquidStakingApr;
    }
  }

  return markets;
}

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
