import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    wrappedNativeToken: "WETH",
    governanceToken: "WELL",
    // Unitroller proxy fronting the Moonwell Ethereum comptroller. Consumers
    // call `enterMarkets` / `exitMarket` on this address to enable / disable
    // a market as collateral; without it the supply page's "Enable as
    // collateral" modal builds against an undefined contract and silently
    // no-ops on confirm.
    comptroller: "0xdec80bb934397575594e91970b37baf65f5b21be",
    views: "0x2d85b9c48a8c582f0AA244e134e9C6f30Cf7786e",
    // MultiRewardDistributor (MRD_PROXY, deployed with MIP-E00) — the
    // comptroller's `rewardDistributor()`. Reward *APRs* come from the `views`
    // contract / indexer, not this address; what needs it is the app's
    // reward-claim flow (useUserRewardsData), which keys off its presence:
    // defined ⇒ claim via the comptroller's `claimReward(holders, mTokens, …)`
    // (the EVM path Base/Optimism use), absent ⇒ fall back to the Moonbeam
    // `0x…0808` precompile `batchAll`, which reverts on Ethereum. Required so
    // users can claim the WELL rewards MIP-X59 starts accruing on Core markets.
    multiRewardDistributor: "0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c",
    multichainGovernor: "0x8769B70ac7c93AF0e75de0D69877709B66d75838",
    // mWETHRouter — wraps native ETH to WETH on supply and unwraps WETH to
    // native ETH on withdraw, matching the mWETHRouter pattern used on Base
    // (0x70778cf...) and Optimism (0xc4Ab8C0...).
    router: "0xa218A4776E2487EaA25e738e6d6a64f21593cA22",
  },
});
