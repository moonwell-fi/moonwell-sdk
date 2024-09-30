import axios from "axios";
export async function getStakingSnapshots(params) {
    try {
        const response = await axios.post(params.environment.indexerUrl, {
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
        }
        else {
            return [];
        }
    }
    catch (ex) {
        console.error("An error occured while fetching getStakingSnapshots...", ex);
        return [];
    }
}
//# sourceMappingURL=getStakingSnapshots.js.map