import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    wrappedNativeToken: "WETH",
    governanceToken: "WELL",
    views: "0x2d85b9c48a8c582f0AA244e134e9C6f30Cf7786e",
    multichainGovernor: "0x8769B70ac7c93AF0e75de0D69877709B66d75838",
    // mWETHRouter — wraps native ETH to WETH on supply and unwraps WETH to
    // native ETH on withdraw, matching the mWETHRouter pattern used on Base
    // (0x70778cf...) and Optimism (0xc4Ab8C0...).
    router: "0xa218A4776E2487EaA25e738e6d6a64f21593cA22",
  },
});
