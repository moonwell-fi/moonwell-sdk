import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  morpho: {
    minimalDeployment: true,
    subgraphUrl:
      "https://api.goldsky.com/api/public/project_cm7wv7gztiq1e01vv7uco1h1y/subgraphs/moonwell-morpho-blue-optimism/production/gn",
    blueApiUrl: "https://blue-api.morpho.org/graphql",
    apiUrl: "https://api.morpho.org/graphql",
    rewardsApiUrl: "https://rewards.morpho.org",
    lunarIndexerUrl:
      "https://lunar-services-worker.moonwell.workers.dev/api/v1/morpho",
  },
  governance: {
    token: "WELL",
    chainIds: [],
  },
  multiRewarder: [{ rewardToken: "WELL" }, { rewardToken: "OP" }],
});
