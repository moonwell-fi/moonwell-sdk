import axios from "axios";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import type { StakingSnapshot } from "../../types/staking.js";

export type GetStakingSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network>;

export type GetStakingSnapshotsReturnType = Promise<StakingSnapshot[]>;

export async function getStakingSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetStakingSnapshotsParameters<environments, Network>,
): GetStakingSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  try {
    const response = await axios.post<{
      data: {
        stakingDailySnapshots: {
          items: StakingSnapshot[];
        };
      };
    }>(environment.indexerUrl, {
      query: `
          query {
            stakingDailySnapshots(
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {chainId: ${environment.chainId}}
            ) {
              items {
                chainId
                totalStaked
                totalStakedUSD
                timestamp
              }
            }
          }
        `,
    });

    if (response.status === 200 && response.data?.data?.stakingDailySnapshots) {
      return response.data?.data?.stakingDailySnapshots.items;
    } else {
      return [];
    }
  } catch (ex) {
    console.error("An error occured while fetching getStakingSnapshots...", ex);
    return [];
  }
}
