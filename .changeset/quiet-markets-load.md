---
"@moonwell-fi/moonwell-sdk": minor
---

Allow isolated-market base data to load independently of public-allocator shared liquidity. Add `includeSharedLiquidity: false` to market actions, explicit liquidity status, and a separate `getMorphoMarketsSharedLiquidity` action with cancellation and a 15-second total request/retry deadline. Existing callers continue to request enrichment by default. Reuse a single Morpho GraphQL response during RPC fallback and omit allocator fields when opted out.

Fix retry counts resetting when Axios merges request configs, stop retries on cancellation, and scope HTTP timeouts to SDK requests without mutating the host application's Axios defaults. Fetch staking APR providers in parallel with each other and core markets, with bounded provider requests and the existing fallback behavior.
