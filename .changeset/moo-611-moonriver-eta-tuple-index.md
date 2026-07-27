---
"@moonwell-fi/moonwell-sdk": patch
---

Read the Moonriver proposal `eta` from the correct `proposals()` tuple index (MOO-611). The legacy single-chain governor returns `(id, proposer, eta, startTimestamp, endTimestamp, ...)` so `eta` is at index 2, whereas the multichain governor returns `(proposer, voteSnapshotTimestamp, votingStartTime, votingEndTime, crossChainVoteCollectionEndTimestamp, ...)` where index 4 is the execution-available timestamp. The SDK was unconditionally reading index 4, so for legacy Moonriver proposals it picked up `endTimestamp` (the voting-end time, already in the past once voting closes). That made the frontend timeline flip straight to "Timelock Ready to Execute" and surface the Execute button before the timelock had actually elapsed. `eta` is now read from index 2 for legacy governors and index 4 for the multichain governor.
