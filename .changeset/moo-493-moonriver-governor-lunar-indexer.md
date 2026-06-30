---
"@moonwell-fi/moonwell-sdk": patch
---

Route Moonriver (chainId 1285) governance through the lunar-indexer Governor API instead of Ponder (`ponder-eu2.moonwell.fi`).

Moonriver proposals (`getProposals`/`getProposal`, via `fetchAllProposals`/`fetchProposal`) and vote receipts (`getUserVoteReceipt`, via `fetchUserVoteReceipt`) now come from the same lunar-indexer Governor API that already serves Moonbeam and Ethereum, using `chainId: 1285`. Moonriver runs a single legacy standalone governor (no multichain governor), so proposals are classified non-multichain and read state/quorum from the legacy governor exactly as the existing Moonbeam-historical path does. `SUPPORTED_GOVERNOR_CHAIN_IDS` now includes 1285 (additive). No public API changes — request/response shapes are identical, and Moonriver's lending `indexerUrl` is untouched. The old Ponder-based proposal fetchers have been removed.
