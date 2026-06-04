---
"@moonwell-fi/moonwell-sdk": patch
---

Make multichain classification a single source of truth so `getProposal` / `getProposals` cannot drift from on-chain routing.

`getProposalsOnChainData` already classified each proposal with the caller env's Artemis cutoff (`classifyProposalMultichain(p, isLocal ? legacyArtemisMaxId : 0)`) to route its governor reads, but `getProposal` and `getProposals` then **re-classified** with `classifyProposalMultichain(apiProposal)` — omitting the cutoff. The two could disagree: a Moonbeam-homed proposal with local-only targets past the Artemis cutoff routed through the multichain governor for its on-chain state, yet was written out with `proposal.multichain` unset (and hub-local Ethereum proposals relied on the home-chain check landing in both places). `getProposalsOnChainData` now returns its `isMultichain` decision on `ProposalOnChainData`, and both fetchers consume it instead of re-deriving — eliminating the divergence and guaranteeing `proposal.multichain` is populated whenever the on-chain reads were routed as multichain. No public API change (`ProposalOnChainData` is internal).
