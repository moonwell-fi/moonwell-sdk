---
"@moonwell-fi/moonwell-sdk": patch
---

Add the Ethereum `multiRewardDistributor` (MRD_PROXY `0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c`, the comptroller's `rewardDistributor()`) to the Ethereum environment config, mirroring Base and Optimism (MOO-413). The SDK derives reward APRs from the `views` contract, but the frontend's reward-claim flow branches on this address: when present it claims via the comptroller's `claimReward`, and when absent it falls back to the Moonbeam `0x…0808` precompile `batchAll` path, which reverts on Ethereum. Without it, the WELL rewards MIP-X59 starts accruing on the four Ethereum Core markets (ETH, USDC, USDT, cbBTC) would be displayed but not claimable.
