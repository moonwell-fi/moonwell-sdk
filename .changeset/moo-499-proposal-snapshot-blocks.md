---
"@moonwell-fi/moonwell-sdk": patch
---

Surface the lunar-indexer's per-chain `snapshotBlocks` on the `Proposal` type (MOO-499). The indexer now resolves and stores the authoritative voting-power snapshot block for each chain (`mainnet`, `base`, `optimism`, `moonbeam`) on the proposal record; `getProposal`/`getProposals` now pass that map straight through. Consumers can read voting power directly at these blocks instead of resolving the snapshot timestamp to a block client-side, which is both faster and more correct (the indexer reads the real on-chain snapshot block, which can differ by one from a timestamp-derived block). The field is optional and absent for proposals indexed before it existed and for on-chain (Moonriver) proposals.
