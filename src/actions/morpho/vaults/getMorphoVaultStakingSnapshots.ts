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
import type { MorphoVaultStakingSnapshot } from "../../../types/morphoVault.js";

dayjs.extend(utc);

export type GetMorphoVaultStakingSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network>;

export type GetMorphoVaultStakingSnapshotsReturnType = Promise<
  MorphoVaultStakingSnapshot[]
>;

export async function getMorphoVaultStakingSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultStakingSnapshotsParameters<environments, Network>,
): GetMorphoVaultStakingSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  return fetchVaultStakingSnapshots(
    (args as GetMorphoVaultStakingSnapshotsParameters<environments, undefined>)
      .vaultAddress,
    environment,
  );
}

async function fetchVaultStakingSnapshots(
  vaultAddress: string,
  environment: Environment,
): Promise<MorphoVaultStakingSnapshot[]> {
  const dailyData: VaultStakingData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface VaultStakingData {
    totalStaked: number;
    totalStakedUSD: number;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        vaultStakingDailySnapshots: {
          items: VaultStakingData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            vaultStakingDailySnapshots (        
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {vaultAddress: "${vaultAddress.toLowerCase()}", chainId: ${environment.chainId}}
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                  totalStaked
                  totalStakedUSD
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

    if (result.data.data.vaultStakingDailySnapshots) {
      dailyData.push(
        ...result.data.data.vaultStakingDailySnapshots.items.filter(
          (f: { timestamp: number }) => isStartOfDay(f.timestamp),
        ),
      );
      hasNextPage =
        result.data.data.vaultStakingDailySnapshots.pageInfo.hasNextPage;
      endCursor =
        result.data.data.vaultStakingDailySnapshots.pageInfo.endCursor;
    }
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: VaultStakingData) => {
      const staked = Number(point.totalStaked);
      const stakedUsd = Number(point.totalStakedUSD);

      const result: MorphoVaultStakingSnapshot = {
        vaultAddress: vaultAddress.toLowerCase(),
        chainId: environment.chainId,
        timestamp: point.timestamp * 1000,
        totalStaked: staked,
        totalStakedUsd: stakedUsd,
      };

      return result;
    });
  } else {
    return [];
  }
}
