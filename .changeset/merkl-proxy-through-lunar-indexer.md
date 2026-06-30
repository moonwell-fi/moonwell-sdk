---
"@moonwell-fi/moonwell-sdk": patch
---

Route Merkl API calls through the lunar-indexer worker proxy instead of hitting `api.merkl.xyz` directly.

Merkl's v4 API needs a server-side API key for production rate limits, which the browser-side SDK cannot hold. Merkl campaign IDs, stkWELL staking APR, and Morpho/staking user rewards are now fetched from the lunar-indexer worker's `/api/v1/merkl` proxy (derived from each environment's `lunarIndexerUrl`), which injects the key and passes the query and response through unchanged. No public API changes — request/response shapes are identical. Consumers that enforce a network/CSP allowlist should ensure the lunar-indexer worker host is permitted (it is already used for other SDK data).
