import axios from "axios";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  Amount,
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  isStartOfDay,
  toApiGranularity,
} from "../../../common/index.js";
import { buildMarketId } from "../../../common/lunar-indexer-helpers.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MarketSnapshot } from "../../../types/market.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
  shouldFallback,
} from "../../lunar-indexer-client.js";
import { transformMarketSnapshots } from "../../lunar-indexer-transformers.js";
import {
  fetchMarketSnapshotsFromIndexer,
  transformIsolatedMarketSnapshotFromIndexer,
} from "../../morpho/markets/lunarIndexerTransform.js";

export type GetMarketSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  type: "core" | "isolated";
  marketId: `0x${string}`;
  /** Predefined time period for snapshots */
  period?: SnapshotPeriod;
  startTime?: number;
  endTime?: number;
};

export type GetMarketSnapshotsReturnType = Promise<MarketSnapshot[]>;

/**
 * Remove snapshots from before the market's first recorded activity.
 * Exported for testing.
 * When a requested time range predates the market's deployment, the indexer
 * returns zero-value records for those early dates. This trims everything
 * before the earliest snapshot that has any supply or borrow activity.
 */
export function trimLeadingEmptySnapshots(
  snapshots: MarketSnapshot[],
): MarketSnapshot[] {
  let firstActiveTimestamp = Number.POSITIVE_INFINITY;
  for (const s of snapshots) {
    if (
      (s.totalSupply > 0 || s.totalBorrows > 0) &&
      s.timestamp < firstActiveTimestamp
    ) {
      firstActiveTimestamp = s.timestamp;
    }
  }
  if (firstActiveTimestamp === Number.POSITIVE_INFINITY) return [];
  return snapshots.filter((s) => s.timestamp >= firstActiveTimestamp);
}

export async function getMarketSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMarketSnapshotsParameters<environments, Network>,
): GetMarketSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  if (args?.type === "core") {
    const snapshots = await fetchCoreMarketSnapshots(
      args.marketId,
      environment,
      args.period,
      args.startTime,
      args.endTime,
    );
    return trimLeadingEmptySnapshots(snapshots);
  }

  const snapshots = await fetchIsolatedMarketSnapshots(
    args.marketId,
    environment,
    args.period,
    args.startTime,
    args.endTime,
  );

  // Isolated markets can receive snapshots from multiple code paths (lunar indexer,
  // Morpho Blue API, subgraph, or a mix). Apply a final sanity check to ensure
  // totalSupply is always in loan token units.
  //
  // Some markets (e.g. USDC/ETH where collateral=USDC, loan=WETH) normalize
  // totalSupply to collateral units — skip the check for those because
  // loanTokenPrice (~$2000) vs implied price (~$1) would incorrectly trigger.
  const marketConfig = Object.values(environment.config.morphoMarkets).find(
    (m) => m.id.toLowerCase() === args.marketId.toLowerCase(),
  );
  const loanSymbol = marketConfig
    ? environment.config.tokens[marketConfig.loanToken]?.symbol
    : undefined;
  const collateralSymbol = marketConfig
    ? environment.config.tokens[marketConfig.collateralToken]?.symbol
    : undefined;
  // Markets where totalSupply is already in collateral units after the inner
  // conversion — skip the outer USDC-unit sanity check for these.
  // • USDC/ETH: normalizeToCollateral flips supply to USDC units (collateral)
  // • stkWELL/USDC: isStkWellMarket block converts USDC supply → stkWELL units
  const isNormalizedMarket =
    (loanSymbol === "ETH" && collateralSymbol === "USDC") ||
    collateralSymbol === "stkWELL";

  const result = isNormalizedMarket
    ? snapshots
    : snapshots.map((snapshot) => {
        if (snapshot.totalSupply === 0 || snapshot.loanTokenPrice === 0)
          return snapshot;
        const impliedLoanPrice = snapshot.totalSupplyUsd / snapshot.totalSupply;
        if (impliedLoanPrice < snapshot.loanTokenPrice * 0.1) {
          return {
            ...snapshot,
            totalSupply: snapshot.totalSupplyUsd / snapshot.loanTokenPrice,
            totalLiquidity:
              snapshot.totalLiquidityUsd / snapshot.loanTokenPrice,
          };
        }
        return snapshot;
      });

  return trimLeadingEmptySnapshots(result);
}

async function fetchCoreMarketSnapshots(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  startTime?: number,
  endTime?: number,
): Promise<MarketSnapshot[]> {
  if (environment.lunarIndexerUrl) {
    try {
      const result = await fetchCoreMarketSnapshotsFromLunar(
        marketAddress,
        environment,
        period,
        startTime,
        endTime,
      );
      return result;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back to Ponder for snapshots:",
        error,
      );
    }
  }

  const result = await fetchCoreMarketSnapshotsFromPonder(
    marketAddress,
    environment,
  );
  return result;
}

async function fetchCoreMarketSnapshotsFromLunar(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  if (!environment.lunarIndexerUrl) {
    throw new Error("Lunar Indexer URL not configured");
  }

  const client = createLunarIndexerClient({
    baseUrl: environment.lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const marketId = buildMarketId(environment.chainId, marketAddress);
  const { startTime, endTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  const allSnapshots: MarketSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await client.getMarketSnapshots(marketId, {
      limit: 1000,
      ...(cursor && { cursor }),
      granularity: toApiGranularity(granularity),
      startTime,
      endTime,
    });

    const transformed = transformMarketSnapshots(
      response.results,
      environment.chainId,
    );

    allSnapshots.push(...transformed);

    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity).map((snapshot) => {
    const supplied = snapshot.totalSupply;
    const suppliedUsd = snapshot.totalSupplyUsd;
    const price = supplied > 0 ? suppliedUsd / supplied : 0;

    return {
      ...snapshot,
      collateralTokenPrice: price,
      loanTokenPrice: price,
    };
  });
}

async function fetchCoreMarketSnapshotsFromPonder(
  marketAddress: string,
  environment: Environment,
): Promise<MarketSnapshot[]> {
  const dailyData: MarketDailyData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface MarketDailyData {
    totalBorrows: number;
    totalBorrowsUSD: number;
    totalSupplies: number;
    totalSuppliesUSD: number;
    totalLiquidity: number;
    totalLiquidityUSD: number;
    baseSupplyApy: number;
    baseBorrowApy: number;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        marketDailySnapshots: {
          items: MarketDailyData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            marketDailySnapshots (
              limit: 1000,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {marketAddress: "${marketAddress.toLowerCase()}", chainId: ${environment.chainId}}
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                totalBorrows
                totalBorrowsUSD
                totalSupplies
                totalSuppliesUSD
                totalLiquidity
                totalLiquidityUSD
                baseSupplyApy
                baseBorrowApy
                timestamp
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
    });

    dailyData.push(
      ...result.data.data.marketDailySnapshots.items.filter(
        (f: { timestamp: number }) => isStartOfDay(f.timestamp),
      ),
    );
    hasNextPage = result.data.data.marketDailySnapshots.pageInfo.hasNextPage;
    endCursor = result.data.data.marketDailySnapshots.pageInfo.endCursor;
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: any) => {
      const supplied = Number(point.totalSupplies);
      const borrow = Number(point.totalBorrows);

      const borrowUsd = Number(point.totalBorrowsUSD);
      const suppliedUsd = Number(point.totalSuppliesUSD);
      const liquidity = Math.max(point.totalLiquidity, 0);
      const liquidityUsd = Math.max(point.totalLiquidityUSD, 0);

      const price = suppliedUsd / supplied;

      const result: MarketSnapshot = {
        marketId: marketAddress.toLowerCase(),
        chainId: environment.chainId,
        timestamp: point.timestamp * 1000,
        totalSupply: supplied,
        totalSupplyUsd: suppliedUsd,
        totalBorrows: borrow,
        totalBorrowsUsd: borrowUsd,
        totalLiquidity: liquidity,
        totalLiquidityUsd: liquidityUsd,
        totalReallocatableLiquidity: 0,
        totalReallocatableLiquidityUsd: 0,
        baseSupplyApy: point.baseSupplyApy,
        baseBorrowApy: point.baseBorrowApy,
        collateralTokenPrice: price,
        loanTokenPrice: price,
      };

      return result;
    });
  } else {
    return [];
  }
}

async function fetchMorphoGraphQL(
  environment: Environment,
  query: string,
  operationName?: string,
  variables?: any,
) {
  try {
    const url =
      environment.custom.morpho?.apiUrl || "https://api.morpho.org/graphql";
    const response = await axios.post(
      url,
      { query: query, operationName, variables },
      { timeout: 5000 },
    );

    if (response.status !== 200 || response.data.errors) {
      if (typeof window !== "undefined") {
        console.debug(
          `[Morpho GraphQL Market Snapshots] Non-200 (${response.statusText}) or errors:`,
          response.data.errors,
        );
      }
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    if (typeof window !== "undefined") {
      console.debug(
        "[Morpho GraphQL Market Snapshots] Error fetching data:",
        error,
      );
    }
    return undefined;
  }
}

// Fetches a timestamp-ms → WELL price map from the WELL market in the indexer.
// Used to correct stkWELL snapshots where the indexer stored collateralTokenPrice = 0.
async function fetchWellPricesByTimestamp(
  lunarIndexerUrl: string,
  chainId: number,
  wellMarketConfig: { id: string; collateralToken: string; loanToken: string },
  startTime: number,
): Promise<Map<number, number>> {
  const wellIsCollateral = wellMarketConfig.collateralToken === "WELL";
  const priceMap = new Map<number, number>();
  let cursor: string | undefined;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await fetchMarketSnapshotsFromIndexer(
      lunarIndexerUrl,
      chainId,
      wellMarketConfig.id,
      {
        startTime,
        granularity: "1d",
        limit: 1000,
        ...(cursor && { cursor }),
      },
    );

    for (const snapshot of response.results) {
      const price = Number.parseFloat(
        wellIsCollateral
          ? snapshot.collateralTokenPrice
          : snapshot.loanTokenPrice,
      );
      if (price > 0) {
        priceMap.set(snapshot.timestamp * 1000, price);
      }
    }

    cursor = response.nextCursor ?? undefined;
    page++;
  } while (cursor !== undefined && page < MAX_PAGES);

  return priceMap;
}

export async function fetchIsolatedMarketSnapshots(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  const lunarIndexerUrl = environment.lunarIndexerUrl;

  if (lunarIndexerUrl) {
    try {
      const { startTime } = calculateTimeRange(
        period,
        customStartTime,
        customEndTime,
      );

      // The USDC/ETH market (collateral = USDC, loan = WETH) needs normalization:
      // the indexer returns totalSupplyAssets in WETH units but the chart needs
      // USDC-equivalent units (totalSupplyAssetsUsd / collateralTokenPrice).
      const marketConfig = Object.values(environment.config.morphoMarkets).find(
        (m) => m.id.toLowerCase() === marketAddress.toLowerCase(),
      );
      const loanSymbol = marketConfig
        ? environment.config.tokens[marketConfig.loanToken]?.symbol
        : undefined;
      const collateralSymbol = marketConfig
        ? environment.config.tokens[marketConfig.collateralToken]?.symbol
        : undefined;
      const normalizeToCollateral =
        loanSymbol === "ETH" && collateralSymbol === "USDC";

      // stkWELL is not priced by the indexer (same oracle as WELL but unrecognized).
      // Fetch the WELL market snapshots concurrently and use their prices to correct
      // any stkWELL snapshots where collateralTokenPrice is 0.
      const isStkWellMarket = collateralSymbol === "stkWELL";
      const wellMarketConfig = isStkWellMarket
        ? Object.values(environment.config.morphoMarkets).find(
            (m) => m.collateralToken === "WELL" || m.loanToken === "WELL",
          )
        : undefined;

      const wellPricesPromise = wellMarketConfig
        ? fetchWellPricesByTimestamp(
            lunarIndexerUrl,
            environment.chainId,
            wellMarketConfig,
            startTime,
          )
        : Promise.resolve(new Map<number, number>());

      const allSnapshots: MarketSnapshot[] = [];
      let cursor: string | undefined;
      const MAX_PAGES = 100;
      let page = 0;

      do {
        const response = await fetchMarketSnapshotsFromIndexer(
          lunarIndexerUrl,
          environment.chainId,
          marketAddress,
          {
            startTime,
            granularity: "1d",
            limit: 1000,
            ...(cursor && { cursor }),
          },
        );

        allSnapshots.push(
          ...response.results
            .filter((s) => isStartOfDay(s.timestamp))
            .map((s) =>
              transformIsolatedMarketSnapshotFromIndexer(s, {
                normalizeToCollateral,
              }),
            ),
        );

        cursor = response.nextCursor ?? undefined;
        page++;
      } while (cursor !== undefined && page < MAX_PAGES);

      // Sanity check for non-normalized markets: detect when totalSupplyAssets was
      // stored in collateral units instead of loan token units (an indexer bug seen on
      // the stkWELL/USDC market). When this happens, totalSupplyUsd / totalSupply is
      // close to collateralTokenPrice rather than loanTokenPrice. Recover the correct
      // loan-token amount from the USD value instead of discarding the data point.
      // We skip normalized markets (e.g. USDC/ETH where totalSupply is already in
      // collateral units after normalization) to avoid false corrections.
      const sanitizedSnapshots = normalizeToCollateral
        ? allSnapshots
        : allSnapshots.map((snapshot) => {
            if (snapshot.totalSupply === 0 || snapshot.loanTokenPrice === 0)
              return snapshot;
            const impliedLoanPrice =
              snapshot.totalSupplyUsd / snapshot.totalSupply;
            if (impliedLoanPrice < snapshot.loanTokenPrice * 0.1) {
              return {
                ...snapshot,
                totalSupply: snapshot.totalSupplyUsd / snapshot.loanTokenPrice,
                totalLiquidity:
                  snapshot.totalLiquidityUsd / snapshot.loanTokenPrice,
              };
            }
            return snapshot;
          });

      if (isStkWellMarket) {
        const wellPriceByTimestampMs = await wellPricesPromise;
        return sanitizedSnapshots.map((snapshot) => {
          // Resolve the collateral (stkWELL) price: use indexed price when available,
          // fall back to the WELL market price fetched concurrently.
          let collateralTokenPrice = snapshot.collateralTokenPrice;
          if (collateralTokenPrice === 0) {
            const wellPrice = wellPriceByTimestampMs.get(snapshot.timestamp);
            if (wellPrice) collateralTokenPrice = wellPrice;
          }

          // The lunar indexer stores totalSupplyAssets in loan-token (USDC) units.
          // All fallback paths (BlueAPI, subgraph) convert to collateral (stkWELL) units:
          //   totalSupply = totalSupplyUsd / collateralTokenPrice
          // Apply the same conversion here so the chart axis is consistent.
          const totalSupply =
            collateralTokenPrice > 0
              ? snapshot.totalSupplyUsd / collateralTokenPrice
              : snapshot.totalSupply;
          const totalLiquidity =
            collateralTokenPrice > 0
              ? snapshot.totalLiquidityUsd / collateralTokenPrice
              : snapshot.totalLiquidity;
          const totalReallocatableLiquidity =
            collateralTokenPrice > 0
              ? snapshot.totalReallocatableLiquidityUsd / collateralTokenPrice
              : snapshot.totalReallocatableLiquidity;

          return {
            ...snapshot,
            collateralTokenPrice,
            totalSupply,
            totalLiquidity,
            totalReallocatableLiquidity,
          };
        });
      }

      return sanitizedSnapshots;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back for isolated market snapshots:",
        error,
      );
    }
  }

  return fetchIsolatedMarketSnapshotsFromBlueApi(
    marketAddress,
    environment,
    period,
    customStartTime,
    customEndTime,
  );
}

async function fetchIsolatedMarketSnapshotsFromBlueApi(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  const marketConfig = Object.values(environment.config.morphoMarkets).find(
    (market) => market.id.toLowerCase() === marketAddress.toLowerCase(),
  );

  const isStkWellMarket =
    marketConfig &&
    environment.config.tokens[marketConfig.collateralToken]?.symbol ===
      "stkWELL";

  // If stkWELL market, fetch WELL price from subgraph. stkWELL and WELL have the same price
  let wellPrice: number | null = null;
  if (isStkWellMarket) {
    const wellMarketConfig = Object.values(
      environment.config.morphoMarkets,
    ).find(
      (market) =>
        market.collateralToken === "WELL" || market.loanToken === "WELL",
    );

    if (wellMarketConfig) {
      const wellQuery = `    
        query getWellPrice {
          wellMarket: marketByUniqueKey(
            chainId: ${environment.chainId}
            uniqueKey: "${wellMarketConfig.id.toLowerCase()}"
          ) {
            loanAsset {
              priceUsd
            }
            collateralAsset {
              priceUsd
            }
          }
        }`;

      const wellResult = await fetchMorphoGraphQL(
        environment,
        wellQuery,
        "getWellPrice",
      );
      if (wellResult?.wellMarket) {
        wellPrice =
          wellMarketConfig.collateralToken === "WELL"
            ? wellResult.wellMarket.collateralAsset.priceUsd
            : wellResult.wellMarket.loanAsset.priceUsd;
      }
    }
  }

  const operationName = "getMarketTotalTimeseries";

  const { startTime } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );
  const variables = {
    options: {
      startTimestamp: startTime,
      interval: "DAY",
    },
  };

  const query = `    
    query getMarketTotalTimeseries($options: TimeseriesOptions) {
      marketTotalTimeseries: marketByUniqueKey(
        chainId: ${environment.chainId}
        uniqueKey: "${marketAddress.toLowerCase()}"
      ) {
        uniqueKey
        loanAsset {
          priceUsd
          decimals
        }
        collateralAsset {
          priceUsd
          decimals
        }
        historicalState {
         supplyApy(options: $options) {
            x
            y
          }
          borrowApy(options: $options) {
            x
            y
          }
          borrowAssets(options: $options) {
            x
            y
          }
          borrowAssetsUsd(options: $options) {
            x
            y
          }
          supplyAssets(options: $options) {
            x
            y
          }
          supplyAssetsUsd(options: $options) {
            x
            y
          }
          liquidityAssets(options: $options) {
            x
            y
          }
          liquidityAssetsUsd(options: $options) {
            x
            y
          }
        }
      }
    }`;

  const result = await fetchMorphoGraphQL(
    environment,
    query,
    operationName,
    variables,
  );

  if (result) {
    try {
      const markets: MarketSnapshot[] =
        result.marketTotalTimeseries.historicalState.borrowAssets.map(
          (
            borrowAssets: {
              x: number;
              y: number;
            },
            index: number,
          ): MarketSnapshot => {
            const loanDecimals =
              result.marketTotalTimeseries.loanAsset.decimals;

            const borrowAssetsUsd =
              result.marketTotalTimeseries.historicalState.borrowAssetsUsd[
                index
              ];

            const supplyAssets =
              result.marketTotalTimeseries.historicalState.supplyAssets[index];

            const supplyAssetsUsd =
              result.marketTotalTimeseries.historicalState.supplyAssetsUsd[
                index
              ];

            const liquidityAssets =
              result.marketTotalTimeseries.historicalState.liquidityAssets[
                index
              ];

            const liquidityAssetsUsd =
              result.marketTotalTimeseries.historicalState.liquidityAssetsUsd[
                index
              ];

            const supplyApy =
              result.marketTotalTimeseries.historicalState.supplyApy[index];

            const borrowApy =
              result.marketTotalTimeseries.historicalState.borrowApy[index];

            let collateralTokenPrice =
              result.marketTotalTimeseries.collateralAsset.priceUsd;
            const loanTokenPrice =
              result.marketTotalTimeseries.loanAsset.priceUsd;

            if (isStkWellMarket && wellPrice !== null) {
              collateralTokenPrice = wellPrice;
            }

            const totalSupply =
              (new Amount(BigInt(supplyAssets.y), Number(loanDecimals)).value *
                loanTokenPrice) /
              collateralTokenPrice;

            const totalBorrows = new Amount(
              BigInt(borrowAssets.y),
              Number(loanDecimals),
            ).value;

            const totalLiquidity =
              (new Amount(BigInt(liquidityAssets.y), Number(loanDecimals))
                .value *
                loanTokenPrice) /
              collateralTokenPrice;

            return {
              chainId: environment.chainId,
              timestamp: borrowAssets.x * 1000,
              marketId: marketAddress.toLowerCase(),
              totalBorrows,
              totalBorrowsUsd: Number(borrowAssetsUsd.y),
              totalSupply,
              totalSupplyUsd: Number(supplyAssetsUsd.y),
              totalLiquidity,
              totalLiquidityUsd: Number(liquidityAssetsUsd.y),
              totalReallocatableLiquidity: 0,
              totalReallocatableLiquidityUsd: 0,
              baseSupplyApy: supplyApy.y,
              baseBorrowApy: borrowApy.y,
              loanTokenPrice,
              collateralTokenPrice,
            };
          },
        );

      return markets;
    } catch (ex) {
      return [];
    }
  } else {
    return [];
  }
}
