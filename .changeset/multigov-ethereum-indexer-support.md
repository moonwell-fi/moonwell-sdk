---
"@moonwell-fi/moonwell-sdk": minor
---

Support the new multigov-ethereum governance indexer. `getProposals` now fetches and merges proposals from both chainId=1 (Ethereum multigov) and chainId=1284 (Moonbeam historical) under the Moonbeam network. `getProposal` and `getUserVoteReceipt` accept an optional `chainId` argument to disambiguate, falling back to trying both chains when omitted.

Internally, every governor-indexer HTTP call now sends a required `chainId` query parameter on the list endpoint and uses chain-prefixed proposal IDs (e.g. `1-0000000007`) on the detail/votes/vote-receipt routes, matching the new indexer contract.

Caveat: Ethereum (chainId=1) proposals returned by `getProposals` currently come back with `quorum = 0n` and a `state` value derived from API events rather than read on-chain, because the Ethereum environment doesn't yet have the multichainGovernor contract wired up. Consumers should treat `quorum.value === 0n` for these proposals as "unknown" rather than as a literal zero quorum until a follow-up release wires the contract.
