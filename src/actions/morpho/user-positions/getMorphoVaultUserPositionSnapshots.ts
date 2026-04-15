import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs, isStartOfDay } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type {
  Chain,
  Environment,
  GetEnvironment,
  VaultsType,
} from "../../../environments/index.js";
import type { MorphoVaultUserPositionSnapshot } from "../../../types/morphoUserPosition.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
  shouldFallback,
} from "../../lunar-indexer-client.js";

dayjs.extend(utc);

export type GetMorphoVaultUserPositionSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  (undefined extends network
    ? {
        /** Address of the vault token (omit to get all vaults for the account) */
        vaultAddress?: Address;
      }
    : {
        /** Vault key */
        vault: keyof VaultsType<GetEnvironment<network>>;
      }) & {
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

  const { vaultAddress: rawVaultAddress, vault } = args as unknown as {
    vaultAddress: Address | undefined;
    vault: string | undefined;
  };

  const vaultAddress: Address | undefined =
    rawVaultAddress ?? (vault ? environment.vaults[vault].address : undefined);

  const lunarIndexerUrl = environment.custom?.morpho?.lunarIndexerUrl;

  if (lunarIndexerUrl) {
    try {
      return await fetchUserPositionSnapshotsFromLunar(
        args.userAddress,
        vaultAddress,
        lunarIndexerUrl,
        environment,
      );
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }
      console.debug(
        "[Lunar fallback] Falling back to Ponder for vault user position snapshots:",
        error,
      );
    }
  }

  if (!vaultAddress) {
    return [];
  }

  return fetchUserPositionSnapshots(
    args.userAddress,
    vaultAddress,
    environment,
  );
}

async function fetchUserPositionSnapshotsFromLunar(
  userAddress: Address,
  vaultAddress: Address | undefined,
  lunarIndexerUrl: string,
  environment: Environment,
): Promise<MorphoVaultUserPositionSnapshot[]> {
  const lunarClient = createLunarIndexerClient({
    baseUrl: lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - 3 * 365 * 24 * 60 * 60;

  const portfolio = await lunarClient.getVaultAccountPortfolio(userAddress, {
    startTime,
    endTime,
    granularity: "1d",
    chainId: environment.chainId,
    ...(vaultAddress ? { vault: vaultAddress } : {}),
  });

  const snapshots: MorphoVaultUserPositionSnapshot[] = [];

  for (const position of portfolio.positions) {
    for (const v of position.vaults) {
      snapshots.push({
        chainId: v.chainId,
        account: userAddress,
        vaultAddress: v.vaultAddress as Address,
        suppliedUsd: v.shareBalanceUsd,
        timestamp: position.timestamp * 1000,
      });
    }
  }

  return snapshots;
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
