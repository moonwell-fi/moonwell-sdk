import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  morpho: {
    minimalDeployment: true,
    subgraphUrl:
      "https://api.goldsky.com/api/public/project_cm7wv7gztiq1e01vv7uco1h1y/subgraphs/moonwell-morpho-blue-optimism/production/gn",
  },
  governance: {
    token: "WELL",
    chainIds: [],
  },
  multiRewarder: [{ rewardToken: "WELL" }, { rewardToken: "OP" }],
});
