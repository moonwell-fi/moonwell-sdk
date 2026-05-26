---
"@moonwell-fi/moonwell-sdk": minor
---

Enable staking on Ethereum mainnet — wire the newly deployed staking views contract (`0xF5f2ae75d762B7e2B42D53f48018436f52Ce5401`) and stkWELL so `getStakingInfo`, `getUserStakingInfo`, and `getStakingSnapshots` return Ethereum entries alongside Base / Optimism / Moonbeam. The Eth views contract is staking-only and does not expose `getUserVotingPower`, so `getUserVotingPowers` skips Ethereum with a one-time console warning.
