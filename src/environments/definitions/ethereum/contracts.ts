import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    governanceToken: "WELL",
    stakingToken: "stkWELL",
    // TODO: Replace with actual MultichainGovernorV2 proxy address (deployed in MIP-X45)
    multichainGovernor: "0x0000000000000000000000000000000000000003",
    // TODO: Replace with actual Views contract address on Ethereum (for getUserVotingPower)
    views: "0x0000000000000000000000000000000000000004",
  },
});
