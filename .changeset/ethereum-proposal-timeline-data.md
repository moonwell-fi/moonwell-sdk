---
"@moonwell-fi/moonwell-sdk": patch
---

Resolve on-chain proposal data for Ethereum-hub multigov proposals fetched through the Moonbeam governance environment. `getProposalsOnChainData` now looks up the proposal's home environment from `publicEnvironments` when the proposal's `chainId` differs from the calling governance env's `chainId`, and reads `state`, `proposalData` (for `eta`), and `chainVoteCollectorVotes` against that env's `multichainGovernor`. Previously, foreign-chain proposals bailed out with `eta: 0` and `votesCollected: false`, which left the proposal-detail timeline stuck without a timelock countdown and unable to flip from "Vote Collection" to "Ready to Execute". Ethereum's `custom.governance.chainIds` is now `[moonbeam, base, optimism]` (the satellites the Ethereum hub talks to) so the per-satellite vote-collector enumeration finds them. Moonbeam-hub proposals are unaffected — they still take the local-env path and behave identically.
