---
"@moonwell-fi/moonwell-sdk": patch
---

Add opt-in `throwOnExternalApiError` option to `getMorphoUserRewards`. When `true`, Merkl API failures propagate to the caller instead of being swallowed and returning `[]`. Defaults to `false`, so existing consumers see no behavior change.
