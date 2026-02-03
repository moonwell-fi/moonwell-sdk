import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs, isStartOfDay } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { UserPositionSnapshot } from "../../../types/userPosition.js";
import {
  createLunarIndexerClient,
  shouldFallback,
} from "../../lunar-indexer-client.js";
import { transformPortfolioToSnapshots } from "../../lunar-indexer-transformers.js";

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
  if (environment.lunarIndexerUrl) {
    try {
      const result = await fetchUserPositionSnapshotsFromLunar(
        userAddress,
        environment,
      );
      return result;
    } catch (error) {
      if (shouldFallback(error)) {
      } else {
        throw error;
      }
    }
  }

  const result = await fetchUserPositionSnapshotsFromPonder(
    userAddress,
    environment,
  );
  return result;
}

async function fetchUserPositionSnapshotsFromLunar(
  userAddress: Address,
  environment: Environment,
): Promise<UserPositionSnapshot[]> {
  if (!environment.lunarIndexerUrl) {
    throw new Error("Lunar Indexer URL not configured");
  }

  const client = createLunarIndexerClient({
    baseUrl: environment.lunarIndexerUrl,
    timeout: 10000,
  });

  const endTime = dayjs.utc().unix();
  const startTime = dayjs.utc().subtract(365, "days").unix();

  const portfolio = await client.getAccountPortfolio(
    userAddress.toLowerCase(),
    {
      startTime,
      endTime,
      granularity: "1d",
      chainId: environment.chainId,
    },
  );

  const snapshots = transformPortfolioToSnapshots(
    portfolio,
    environment.chainId,
  );

  const filteredSnapshots = snapshots.filter((snapshot) =>
    isStartOfDay(Math.floor(snapshot.timestamp / 1000)),
  );

  return filteredSnapshots;
}

async function fetchUserPositionSnapshotsFromPonder(
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
