---
"@moonwell-fi/moonwell-sdk": patch
---

Fix the Morpho V2 vault APY query used by the on-chain fallback path. Morpho's API removed `VaultV2.avgApy` and `VaultStateReward.yearlySupplyTokens`, so every `vaultV2ByAddress` request failed validation with HTTP 400 and V2 vaults got no APY or liquidity from Morpho. Both fields are dropped from the query and from the internal response types; `avgNetApy`, which the SDK actually reads, is unchanged.
