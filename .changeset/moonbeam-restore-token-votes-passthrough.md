---
"@moonwell-fi/moonwell-sdk": patch
---

Remove the Moonbeam-specific `tokenVotes` mask from `getUserVotingPowers` and `getDelegates`. The Moonbeam `MoonwellViews` implementation was upgraded on-chain to read xWELL for `tokenVotes` (matching Base and Optimism), so the temporary `RAW_WELL_MASKED_CHAINS` workaround is no longer needed. Both actions now return the views response unchanged on Moonbeam, the same as every other chain, so `totalDelegated` once again reflects the user's full xWELL + stkWELL + claims voting power on Moonbeam instead of zeroing the xWELL contribution.
