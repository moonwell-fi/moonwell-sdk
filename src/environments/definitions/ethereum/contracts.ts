import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    governanceToken: "WELL",
    views: "0xF5f2ae75d762B7e2B42D53f48018436f52Ce5401",
  },
});
