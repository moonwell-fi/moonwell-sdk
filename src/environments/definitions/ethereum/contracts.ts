import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    // `governanceToken` + `stakingToken` are how the frontend's stake-page
    // chain picker and `getStakingInfo` / `getUserStakingInfo` discover that
    // Ethereum supports staking. Token addresses live in `tokens.ts`.
    governanceToken: "WELL",
    stakingToken: "stkWELL",
  },
});
