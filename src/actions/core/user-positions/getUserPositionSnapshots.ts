import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs, isStartOfDay } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { UserPositionSnapshot } from "../../../types/userPosition.js";

dayjs.extend(utc);

export type GetUserPositionSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserPositionSnapshotsReturnType = Promise<
  UserPositionSnapshot[]
>;

export async function getUserPositionSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserPositionSnapshotsParameters<environments, Network>,
): GetUserPositionSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  return fetchUserPositionSnapshots(args.userAddress, environment);
}

async function fetchUserPositionSnapshots(
  userAddress: Address,
  environment: Environment,
): Promise<UserPositionSnapshot[]> {
  const dailyData: UserDailyData[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  interface UserDailyData {
    totalBorrowsUSD: string;
    totalSuppliesUSD: string;
    totalCollateralUSD: string;
    timestamp: number;
  }

  while (hasNextPage) {
    const result = await axios.post<{
      data: {
        accountDailySnapshots: {
          items: UserDailyData[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            accountDailySnapshots(
              limit: 365,
              orderDirection: "desc",
              orderBy: "timestamp",
              where: { accountAddress: "${userAddress.toLowerCase()}", chainId: ${environment.chainId} }
              ${endCursor ? `after: "${endCursor}"` : ""}
            ) {
              items {
                timestamp,
                totalBorrowsUSD,
                totalSuppliesUSD,
                totalCollateralUSD,
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
      ...result.data.data.accountDailySnapshots.items.filter(
        (f: { timestamp: number }) => isStartOfDay(f.timestamp),
      ),
    );
    hasNextPage = result.data.data.accountDailySnapshots.pageInfo.hasNextPage;
    endCursor = result.data.data.accountDailySnapshots.pageInfo.endCursor;
  }

  if (dailyData.length > 0) {
    return dailyData.map((point: UserDailyData) => {
      const borrowUsd = Number(point.totalBorrowsUSD);
      const suppliedUsd = Number(point.totalSuppliesUSD);
      const collateralUsd = Number(point.totalCollateralUSD);

      const result: UserPositionSnapshot = {
        chainId: environment.chainId,
        timestamp: point.timestamp * 1000,
        totalSupplyUsd: suppliedUsd,
        totalBorrowsUsd: borrowUsd,
        totalCollateralUsd: collateralUsd,
      };

      return result;
    });
  } else {
    return [];
  }
}
