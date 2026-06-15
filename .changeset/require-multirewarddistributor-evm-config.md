---
"@moonwell-fi/moonwell-sdk": minor
---

Require `multiRewardDistributor` at the type level for EVM comptroller environments. **Type-breaking** for direct callers of `createContractsConfig`: a config with a `comptroller` and no `governor` that omits `multiRewardDistributor` no longer compiles. `createContractsConfig` now rejects a contracts config that defines a `comptroller` but no `governor` (i.e. Base/Optimism/Ethereum) unless it also defines `multiRewardDistributor` — closing the gap that let Ethereum ship without it and silently break reward claims (MOO-413). Moonbeam and Moonriver, which use the on-chain `governor` + WELL precompile reward model, are unaffected and correctly continue to omit it. A runtime invariant test across `publicEnvironments` backstops the type guard.
