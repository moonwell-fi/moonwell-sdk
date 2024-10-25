import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  Amount,
  getEnvironmentFromArgs,
  isStartOfDay,
} from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MarketSnapshot } from "../../../types/market.js";

dayjs.extend(utc);

export type GetMarketSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  type: "core" | "isolated";
  marketId: `0x${string}`;
};

export type GetMarketSnapshotsReturnType = Promise<MarketSnapshot[]>;

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
    return fetchCoreMarketSnapshots(args.marketId, environment);
  } else {
    return fetchIsolatedMarketSnapshots(args.marketId, environment);
  }
}

async function fetchCoreMarketSnapshots(
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

      let liquidity = supplied - borrow > 0 ? supplied - borrow : 0;
      let liquidityUsd = supplied - borrow > 0 ? suppliedUsd - borrowUsd : 0;
      liquidity = Math.max(liquidity, 0);
      liquidityUsd = Math.max(liquidityUsd, 0);

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
      };

      return result;
    });
  } else {
    return [];
  }
}

async function fetchMorphoGraphQL(
  query: string,
  operationName?: string,
  variables?: any,
) {
  try {
    const response = await axios.post(
      "https://blue-api.morpho.org/graphql",
      { query: query, operationName, variables },
      { timeout: 5000 },
    );

    if (response.status !== 200 || response.data.errors) {
      console.log(
        `Non-200 (${response.statusText}
        }) or other error from Morpho GraphQL! - ${JSON.stringify(response.data)}`,
      );
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    return undefined;
  }
}

async function fetchIsolatedMarketSnapshots(
  marketAddress: string,
  environment: Environment,
): Promise<MarketSnapshot[]> {
  const operationName = "getMarketTotalTimeseries";

  const variables = {
    options: {
      startTimestamp: dayjs.utc().subtract(1, "year").unix(),
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

  const result = await fetchMorphoGraphQL(query, operationName, variables);

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
            const collateralPrice =
              result.marketTotalTimeseries.collateralAsset.priceUsd;
            const loanPrice = result.marketTotalTimeseries.loanAsset.priceUsd;

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

            return {
              chainId: environment.chainId,
              timestamp: borrowAssets.x * 1000,
              marketId: marketAddress.toLowerCase(),
              totalBorrows: new Amount(
                BigInt(borrowAssets.y),
                Number(loanDecimals),
              ).value,
              totalBorrowsUsd: Number(borrowAssetsUsd.y),
              totalSupply:
                (new Amount(BigInt(supplyAssets.y), Number(loanDecimals))
                  .value *
                  loanPrice) /
                collateralPrice,
              totalSupplyUsd: Number(supplyAssetsUsd.y),
              totalLiquidity:
                (new Amount(BigInt(liquidityAssets.y), Number(loanDecimals))
                  .value *
                  loanPrice) /
                collateralPrice,
              totalLiquidityUsd: Number(liquidityAssetsUsd.y),
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