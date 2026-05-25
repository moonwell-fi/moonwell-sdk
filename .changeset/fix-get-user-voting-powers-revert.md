---
"@moonwell-fi/moonwell-sdk": patch
---

fix(governance): use allSettled in getUserVotingPowers so a reverted views contract on one chain does not abort the whole call

Moonbeam's MoonwellViews contract reverts on `getUserVotingPower` calls, causing the
entire `getUserVotingPowers` action to throw and leaving every page that calls
`useUserVotingPowers` (markets/supply, markets/withdraw, portfolio, stake, discover)
broken for all connected wallets. This is tracked as Sentry issue MOONWELL-FRONTEND-S3
(~10 000 events, 1 143 users affected, status: escalating).

Root cause: `Promise.all` propagates the first rejection immediately and discards
results from other chains. Moonbeam's views contract revert on `getUserVotingPower`
triggered this for every WELL-token query.

Fix: replace `Promise.all` with `Promise.allSettled` for both the per-chain block-number
lookups and the `views.read.getUserVotingPower` reads. Rejected chains are filtered out
and reported via `env.onError` (consistent with the existing pattern in `getStakingInfo`
and `getUserStakingInfo`). Chains whose views contract works are unaffected.
