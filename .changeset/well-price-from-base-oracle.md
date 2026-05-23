---
"@moonwell-fi/moonwell-sdk": patch
---

Read WELL/USD from the Base lending oracle's mWELL underlying price across all chains, instead of the per-chain views.getGovernanceTokenPrice(). The Moonbeam views contract returns stale data and the Base views returns 0; the Base oracle is the authoritative Chainlink-fed source. Also restore staking info on Moonbeam by falling back to direct stkWELL reads when the views' getStakingInfo() reverts.
