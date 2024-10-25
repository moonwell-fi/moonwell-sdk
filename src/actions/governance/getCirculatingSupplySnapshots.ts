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

  try {
    const response = await axios.post<{
      data: {
        circulatingSupplyDailySnapshots: {
          items: {
            chainId: number;
            tokenAddress: string;
            circulatingSupply: number;
            timestamp: number;
          }[];
        };
      };
    }>(environment.indexerUrl, {
      query: `
          {
            circulatingSupplyDailySnapshots(
              where: { chainId: ${environment.chainId} }
              orderBy: "timestamp"
              orderDirection: "desc"
              limit: 1000
            ) {
              items {
                chainId
                tokenAddress
                circulatingSupply
                timestamp
              }
            }
          }
        `,
    });

    if (
      response.status === 200 &&
      response.data?.data?.circulatingSupplyDailySnapshots
    ) {
      return response.data?.data?.circulatingSupplyDailySnapshots.items.map(
        (item) => ({
          chainId: item.chainId,
          token: Object.values(environment.config.tokens).find(
            (token) =>
              token.address.toLowerCase() === item.tokenAddress.toLowerCase(),
          )!,
          circulatingSupply: item.circulatingSupply,
          timestamp: item.timestamp,
        }),
      );
    } else {
      return [];
    }
  } catch (ex) {
    console.error("An error occured while fetching getStakingSnapshots...", ex);
    return [];
  }
}
