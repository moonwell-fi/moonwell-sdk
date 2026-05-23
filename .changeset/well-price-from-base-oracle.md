---
"@moonwell-fi/moonwell-sdk": patch
---

Read WELL/USD from the Base lending oracle's mWELL underlying price across all WELL-governed chains, instead of the per-chain views.getGovernanceTokenPrice(). The Moonbeam views contract returns stale data and the Base views returns 0; the Base oracle is the authoritative Chainlink-fed source. Moonriver (MFAM) keeps reading its own per-chain price — only WELL-governed chains route through Base.

Also restore staking info on Moonbeam by falling back to direct stkWELL reads when the views' getStakingInfo() / getUserStakingInfo() revert. The stkWELL fallback now reads each field independently (Promise.allSettled) so a transient RPC failure on one read doesn't erase the whole fallback.

**Note for consumers:** every WELL price read now requires Base RPC access. If you create a MoonwellClient with only Moonbeam or Optimism configured, the SDK will fall back to the default public Base RPC. Configure Base explicitly in `networks` to honor your own RPC URL and onError handler.
