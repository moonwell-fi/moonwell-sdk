import { createCustomConfig } from "../../types/config.js";

export const custom = createCustomConfig({
  morpho: {
    minimalDeployment: true,
    apiUrl: "https://api.morpho.org/graphql",
    rewardsApiUrl: "https://rewards.morpho.org",
  },
  governance: {
    token: "WELL",
    chainIds: [],
  },
  wormhole: {
    chainId: 24,
  },
  multiRewarder: [{ rewardToken: "WELL" }, { rewardToken: "OP" }],
});
