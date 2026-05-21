---
"@moonwell-fi/moonwell-sdk": minor
---

Add opt-in `throwOnExternalApiError` option to `getMorphoUserRewards`. When `true`, Merkl API failures (non-ok HTTP responses, network rejections, and response-body parse errors) propagate to the caller as `MerklApiError` instead of being swallowed and returning `[]`. Defaults to `false`, so existing consumers see no behavior change.

When multiple chains are queried and at least one fails while others succeed, the action throws a `MorphoUserRewardsAggregateError` whose `errors` array carries the per-chain failures and whose `rewards` property carries the rewards from chains that succeeded, so callers can surface partial results alongside the failures.

New public exports: `MerklApiError`, `MorphoUserRewardsAggregateError`.
