import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    governanceToken: "WELL",
    views: "0xA061Ed814bBd1b03e8df0B7AbEbc40f4A6feb895",
    multichainGovernor: "0x8769B70ac7c93AF0e75de0D69877709B66d75838",
  },
});
