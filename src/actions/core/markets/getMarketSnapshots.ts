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
import { getSubgraph } from "../../morpho/utils/graphql.js";

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
    if (environment.custom.morpho?.minimalDeployment === false) {
      return fetchIsolatedMarketSnapshots(args.marketId, environment);
    } else {
      return fetchIsolatedMarketSnapshotsSubgraph(args.marketId, environment);
    }
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

      const wellResult = await fetchMorphoGraphQL(wellQuery, "getWellPrice");
      if (wellResult?.wellMarket) {
        wellPrice =
          wellMarketConfig.collateralToken === "WELL"
            ? wellResult.wellMarket.collateralAsset.priceUsd
            : wellResult.wellMarket.loanAsset.priceUsd;
      }
    }
  }

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

async function fetchIsolatedMarketSnapshotsSubgraph(
  marketAddress: string,
  environment: Environment,
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
        {
          marketDailySnapshots (where:{market:"${wellMarketConfig.id.toLowerCase()}"}, orderBy:timestamp, orderDirection:desc, first: 1) {
            inputTokenPriceUSD
            outputTokenPriceUSD
          }
        }
      `;

      const wellResult = await getSubgraph<{
        marketDailySnapshots: Array<{
          inputTokenPriceUSD: string;
          outputTokenPriceUSD: string;
        }>;
      }>(environment, wellQuery);

      if (wellResult?.marketDailySnapshots?.[0]) {
        wellPrice =
          wellMarketConfig.collateralToken === "WELL"
            ? Number(wellResult.marketDailySnapshots[0].inputTokenPriceUSD)
            : Number(wellResult.marketDailySnapshots[0].outputTokenPriceUSD);
      }
    }
  }

  const query = `    
    {
      marketDailySnapshots (where:{market:"${marketAddress.toLowerCase()}"}, orderBy:timestamp, orderDirection:desc, first: 365) {
        market {
          maximumLTV
          inputToken {
            decimals
          }
          borrowedToken {
            decimals
          }
        }
        variableBorrowedTokenBalance
        outputTokenPriceUSD
        inputTokenPriceUSD
        inputTokenBalance
        timestamp      
      }
    }
`;

  const result = await getSubgraph<{
    marketDailySnapshots: Array<{
      market: {
        maximumLTV: string;
        inputToken: {
          symbol: string;
          decimals: number;
        };
        borrowedToken: {
          symbol: string;
          decimals: number;
        };
      };
      variableBorrowedTokenBalance: string;
      outputTokenPriceUSD: string;
      inputTokenPriceUSD: string;
      inputTokenBalance: string;
      timestamp: number;
    }>;
  }>(environment, query);

  if (result) {
    try {
      const markets: MarketSnapshot[] = result.marketDailySnapshots.map(
        (item) => {
          const supplyDecimals = item.market.borrowedToken.decimals;

          const supplyAssets = item.inputTokenBalance;

          const totalSupplyInLoanToken = new Amount(
            BigInt(supplyAssets),
            Number(supplyDecimals),
          ).value;

          let collateralTokenPrice = Number(item.inputTokenPriceUSD);

          if (isStkWellMarket && wellPrice !== null) {
            collateralTokenPrice = wellPrice;
          }

          const totalSupply = totalSupplyInLoanToken / collateralTokenPrice;

          const borrowAssets = item.variableBorrowedTokenBalance;

          const totalBorrows = new Amount(
            BigInt(borrowAssets),
            Number(supplyDecimals),
          ).value;

          const totalLiquidityInLoanToken = Math.max(
            totalSupplyInLoanToken - totalBorrows,
            0,
          );

          const totalLiquidity =
            totalLiquidityInLoanToken / collateralTokenPrice;

          return {
            chainId: environment.chainId,
            timestamp: item.timestamp * 1000,
            marketId: marketAddress.toLowerCase(),
            totalBorrows,
            totalBorrowsUsd: Number(item.outputTokenPriceUSD) * totalBorrows,
            totalSupply,
            totalSupplyUsd: collateralTokenPrice * totalSupply,
            totalLiquidity,
            totalLiquidityUsd:
              Number(item.outputTokenPriceUSD) * totalLiquidityInLoanToken,
            baseSupplyApy: 0,
            baseBorrowApy: 0,
            loanTokenPrice: Number(item.outputTokenPriceUSD),
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
