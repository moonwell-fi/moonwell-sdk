import type { StakingSnapshot } from "@/types/staking.js";
import type { Environment } from "@moonwell-sdk/environments";
import axios from "axios";

export async function getStakingSnapshots(params: {
  environment: Environment;
}): Promise<StakingSnapshot[]> {
  try {
    const response = await axios.post<{
      data: {
        stakingDailySnapshots: {
          items: StakingSnapshot[];
        };
      };
    }>(params.environment.indexerUrl, {
      query: `
          query {
            stakingDailySnapshots(
              limit: 365,
              orderBy: "timestamp"
              orderDirection: "desc"
              where: {chainId: ${params.environment.chainId}}
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
