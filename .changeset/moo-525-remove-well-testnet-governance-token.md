---
"@moonwell-fi/moonwell-sdk": minor
---

Breaking: removed the vestigial `WELL_TESTNET` entry from `GovernanceTokensConfig`, narrowing the exported `GovernanceToken` type to `"WELL" | "MFAM"` (MOO-525). `WELL_TESTNET` had an empty `chainIds` array and was referenced by no environment, action, or test — it was dead config left over from the testnet era. Consumers passing `"WELL_TESTNET"` or reading `GovernanceTokensConfig.WELL_TESTNET` must remove those references.
