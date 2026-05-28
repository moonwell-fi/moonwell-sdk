---
"@moonwell-fi/moonwell-sdk": minor
---

Exclude raw WELL (`tokenVotes`) from voting power on Moonbeam (chainId 1284). Raw WELL — even delegated — is no longer an eligible voting source on Moonbeam; users vote with stkWELL (via `stakingVotes`) and xWELL only. `getUserVotingPowers` now returns zero for every `token*` field on Moonbeam and excludes the `tokenVotes` contribution from `totalDelegated`, `totalDelegatedSelf`, and `totalDelegatedOthers`. `getDelegates` applies the same mask when ranking delegates by voting power. The Moonbeam views contract still surfaces a non-zero `tokenVotes` tuple, so the SDK masks it here to keep results honest until the on-chain views are updated. Other chains (Base, Optimism, Ethereum) are unaffected.
