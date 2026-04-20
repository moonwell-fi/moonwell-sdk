import axios from "axios";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import type { CirculatingSupplySnapshot } from "../../types/circulatingSupply.js";

export type GetCirculatingSupplySnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network>;

export type GetCirculatingSupplySnapshotsReturnType = Promise<
  CirculatingSupplySnapshot[]
>;

interface LunarCirculatingSupplySnapshot {
  id: string;
  chainId: number;
  tokenAddress: string;
  tokenLabel: string;
  timestamp: number;
  blockNumber: string;
  totalSupply: string;
  excludedBalance: string;
  circulatingSupply: string;
}

interface LunarPaginatedResponse<T> {
  results: T[];
  nextCursor: string | null;
}

async function fetchCirculatingSupplyFromLunar(
  lunarIndexerUrl: string,
  chainId: number,
): Promise<LunarCirculatingSupplySnapshot[]> {
  const all: LunarCirculatingSupplySnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 10;
  let page = 0;

  do {
    const params: Record<string, string> = { limit: "1000" };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get<
      LunarPaginatedResponse<LunarCirculatingSupplySnapshot>
    >(`${lunarIndexerUrl}/api/v1/staking/circulating-supply/${chainId}`, {
      params,
    });

    all.push(...response.data.results);
    cursor = response.data.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  return all;
}

export async function getCirculatingSupplySnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetCirculatingSupplySnapshotsParameters<environments, Network>,
): GetCirculatingSupplySnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  if (!environment.lunarIndexerUrl) {
    return [];
  }

  const items = await fetchCirculatingSupplyFromLunar(
    environment.lunarIndexerUrl,
    environment.chainId,
  );
  return items.flatMap((item) => {
    const token = Object.values(environment.config.tokens).find(
      (t) => t.address.toLowerCase() === item.tokenAddress.toLowerCase(),
    );
    if (!token) return [];
    return [
      {
        chainId: item.chainId,
        token,
        circulatingSupply: Number.parseFloat(item.circulatingSupply),
        totalSupply: item.totalSupply,
        excludedBalance: item.excludedBalance,
        timestamp: item.timestamp,
      },
    ];
  });
}
