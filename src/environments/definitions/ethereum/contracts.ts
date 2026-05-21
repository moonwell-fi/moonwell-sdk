import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    // `stakingToken` is intentionally omitted until Ethereum staking contracts ship.
    governanceToken: "WELL",
  },
});
