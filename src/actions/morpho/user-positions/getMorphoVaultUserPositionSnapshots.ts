import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs, isStartOfDay } from "../../../common/index.js";
import type {
  MorphoVaultParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MorphoVaultUserPositionSnapshot } from "../../../types/morphoUserPosition.js";

dayjs.extend(utc);

export type GetMorphoVaultUserPositionSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoVaultParameterType<network> & {
    userAddress: Address;
  };

export type GetMorphoVaultUserPositionSnapshotsReturnType = Promise<
  MorphoVaultUserPositionSnapshot[]
>;

export async function getMorphoVaultUserPositionSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoVaultUserPositionSnapshotsParameters<environments, Network>,
): GetMorphoVaultUserPositionSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  let { vaultAddress, vault } = args as unknown as {
    vaultAddress: Address;
    vault: string;
  };

  if (!vaultAddress) {
    vaultAddress = environment.vaults[vault].address;
  }

  return fetchUserPositionSnapshots(
    args.userAddress,
    vaultAddress,
    environment,
  );
}

async function fetchUserPositionSnapshots(
  userAddress: Address,
  vaultAddress: Address,
  environment: Environment,
): Promise<MorphoVaultUserPositionSnapshot[]> {
  const dailyData: MorphoVaultUserDailyData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface MorphoVaultUserDailyData {
    totalSuppliesUSD: string;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        accountVaultDailySnapshots: {
          items: MorphoVaultUserDailyData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            accountVaultDailySnapshots(
              limit: 365,
              orderDirection: "desc",
              orderBy: "timestamp",
              where: { vaultAddress: "${vaultAddress.toLowerCase()}", accountAddress: "${userAddress.toLowerCase()}", chainId: ${environment.chainId} }
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
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
      ...result.data.data.accountVaultDailySnapshots.items.filter(
        (f: { timestamp: number }) => isStartOfDay(f.timestamp),
      ),
    );
    hasNextPage =
      result.data.data.accountVaultDailySnapshots.pageInfo.hasNextPage;
    endCursor = result.data.data.accountVaultDailySnapshots.pageInfo.endCursor;
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: MorphoVaultUserDailyData) => {
      const suppliedUsd = Number(point.totalSuppliesUSD);

      const result: MorphoVaultUserPositionSnapshot = {
        chainId: environment.chainId,
        timestamp: point.timestamp * 1000,
        suppliedUsd: suppliedUsd,
        account: userAddress,
        vaultAddress: vaultAddress,
      };

      return result;
    });
  } else {
    return [];
  }
}
