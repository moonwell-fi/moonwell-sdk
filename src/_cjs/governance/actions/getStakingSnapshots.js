"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStakingSnapshots = void 0;
const axios_1 = require("axios");
async function getStakingSnapshots(params) {
    try {
        const response = await axios_1.default.post(params.environment.indexerUrl, {
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
exports.getStakingSnapshots = getStakingSnapshots;
//# sourceMappingURL=getStakingSnapshots.js.map