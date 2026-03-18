import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  morpho: {
    minimalDeployment: true,
    apiUrl: "https://api.morpho.org/graphql",
    rewardsApiUrl: "https://rewards.morpho.org",
    lunarIndexerUrl: "https://lunar-services-worker.moonwell.workers.dev",
  },
  governance: {
    token: "WELL",
    chainIds: [],
  },
  multiRewarder: [{ rewardToken: "WELL" }, { rewardToken: "OP" }],
});
