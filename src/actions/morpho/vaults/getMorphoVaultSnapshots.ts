import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs, isStartOfDay } from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MorphoVaultSnapshot } from "../../../types/morphoVault.js";

dayjs.extend(utc);

export type GetMorphoVaultSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network>;

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

  return fetchVaultSnapshots(
    (args as GetMorphoVaultSnapshotsParameters<environments, undefined>)
      .vaultAddress,
    environment,
  );
}

async function fetchVaultSnapshots(
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
