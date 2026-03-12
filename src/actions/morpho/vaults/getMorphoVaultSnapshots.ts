import axios from "axios";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  isStartOfDay,
  toApiGranularity,
} from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MorphoVaultSnapshot } from "../../../types/morphoVault.js";
import {
  fetchVaultSnapshotsFromIndexer,
  transformVaultSnapshotsFromIndexer,
} from "./lunarIndexerTransform.js";

export type GetMorphoVaultSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    period?: "1M" | "3M" | "1Y" | "ALL";
    startTime?: number;
    endTime?: number;
  };

export type GetMorphoVaultSnapshotsReturnType = Promise<MorphoVaultSnapshot[]>;

export async function getMorphoVaultSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultSnapshotsParameters<environments, Network>,
): GetMorphoVaultSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  const {
    vaultAddress,
    period,
    startTime: customStartTime,
    endTime: customEndTime,
  } = args as GetMorphoVaultSnapshotsParameters<environments, undefined>;

  const lunarIndexerUrl = environment.custom?.morpho?.lunarIndexerUrl;

  if (lunarIndexerUrl) {
    return fetchVaultSnapshotsFromLunarIndexer(
      vaultAddress,
      environment.chainId,
      lunarIndexerUrl,
      period,
      customStartTime,
      customEndTime,
    );
  }

  return fetchVaultSnapshotsFromPonder(vaultAddress, environment);
}

async function fetchVaultSnapshotsFromLunarIndexer(
  vaultAddress: string,
  chainId: number,
  lunarIndexerUrl: string,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MorphoVaultSnapshot[]> {
  const vaultId = `${chainId}-${vaultAddress.toLowerCase()}`;
  const allSnapshots: MorphoVaultSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  const { startTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  do {
    const response = await fetchVaultSnapshotsFromIndexer(
      lunarIndexerUrl,
      vaultId,
      {
        limit: 1000,
        granularity: toApiGranularity(granularity),
        startTime,
        ...(cursor && { cursor }),
      },
    );

    const transformed = transformVaultSnapshotsFromIndexer(
      response.results,
      chainId,
    );

    allSnapshots.push(...transformed);
    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity);
}

async function fetchVaultSnapshotsFromPonder(
  vaultAddress: string,
  environment: Environment,
): Promise<MorphoVaultSnapshot[]> {
  const dailyData: VaultDailyData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface VaultDailyData {
    totalBorrows: number;
    totalBorrowsUSD: number;
    totalSupplies: number;
    totalSuppliesUSD: number;
    totalLiquidity: number;
    totalLiquidityUSD: number;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        vaultDailySnapshots: {
          items: VaultDailyData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            vaultDailySnapshots (
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {vaultAddress: "${vaultAddress.toLowerCase()}", chainId: ${environment.chainId}}
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                  totalBorrows
                  totalBorrowsUSD
                  totalSupplies
                  totalSuppliesUSD
                  totalLiquidity
                  totalLiquidityUSD
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

    if (result.data.data.vaultDailySnapshots) {
      dailyData.push(
        ...result.data.data.vaultDailySnapshots.items.filter(
          (f: { timestamp: number }) => isStartOfDay(f.timestamp),
        ),
      );
      hasNextPage = result.data.data.vaultDailySnapshots.pageInfo.hasNextPage;
      endCursor = result.data.data.vaultDailySnapshots.pageInfo.endCursor;
    }
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: VaultDailyData) => {
      const supplied = Number(point.totalSupplies);
      const borrow = Number(point.totalBorrows);
      const borrowUsd = Number(point.totalBorrowsUSD);
      const suppliedUsd = Number(point.totalSuppliesUSD);
      const liquidity = Number(point.totalLiquidity);
      const liquidityUsd = Number(point.totalLiquidityUSD);

      const result: MorphoVaultSnapshot = {
        vaultAddress: vaultAddress.toLowerCase(),
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
