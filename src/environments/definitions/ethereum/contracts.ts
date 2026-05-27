import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    governanceToken: "WELL",
    views: "0x2d85b9c48a8c582f0AA244e134e9C6f30Cf7786e",
    multichainGovernor: "0x8769B70ac7c93AF0e75de0D69877709B66d75838",
  },
});
