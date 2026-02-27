import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    governanceToken: "MFAM",
    stakingToken: "stkMFAM",
    wrappedNativeToken: "WMOVR",
    comptroller: "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E",
    maximillion: "0x1650C0AD9483158f9e240fd58d0E173807A80CcC",
    views: "0x6F0cC02e5a7640B28F538fcc06bCA3BdFA57d1BB",
    oracle: "0x892bE716Dcf0A6199677F355f45ba8CC123BAF60",
    governor: "0x2BE2e230e89c59c8E20E633C524AD2De246e7370",
  },
});
