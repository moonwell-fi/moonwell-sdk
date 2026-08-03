---
"@moonwell-fi/moonwell-sdk": minor
---

**Breaking:** remove the sunset Moonbeam and Moonriver chains (MOO-551). Both chains are halted and their RPC endpoints are being decommissioned, so nothing on-chain can be read for them any more.

Governance history is preserved. `getProposals` and `getProposal` now source every governance chain — Ethereum (1), Moonbeam (1284) and Moonriver (1285) — from the governance indexer via whichever environment is registered, preferring the Ethereum multigov hub. Previously both actions required a Moonbeam or Moonriver environment and returned `[]` / `undefined` without one, so removing the chains would otherwise have emptied the entire proposal surface.

Sunset-chain proposals lose only their on-chain half: they surface with indexer-derived state, votes, timestamps and state changes, but no `quorum` (reported as 0), no `eta`, and no `multichain` field unless their targets identify them as bridged.

Removed from the public API:

- `moonbeam` / `moonriver` chain exports, and `MoonbeamEnvironment` / `MoonriverEnvironment` types
- `publicEnvironments.moonbeam` / `.moonriver`; `createEnvironment({ chain: moonbeam })` now throws
- `networks.moonbeam` / `networks.moonriver` on `createMoonwellClient` — `SupportedChains` and `SupportedChainsIds` narrow accordingly
- `GovernanceTokensConfig.MFAM`, narrowing `GovernanceToken` from `"WELL" | "MFAM"` to `"WELL"`; `WELL.chainIds` no longer lists 1284

Behavior changes on surviving chains:

- `getGovernanceTokenInfo` reads WELL total supply from the Ethereum hub instead of Moonbeam, so the reported figure is the hub's xWELL supply rather than Moonbeam's historical total
- `getDelegates` and `getUserVotingPowers` no longer include Moonbeam, so voting-power totals exclude any WELL that remained there
- Base and Optimism previously resolved their `homeEnvironment` to Moonbeam and priced native-token reward incentives from Moonbeam's views contract; each chain now resolves to itself
