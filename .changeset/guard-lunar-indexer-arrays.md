---
"@moonwell-fi/moonwell-sdk": patch
---

Guard the remaining Lunar Indexer response shapes that the SDK iterated unguarded (MOO-535):

- `getMarkets`: a 2xx markets body without `results` now throws a descriptive error that `getMarketsData` catches, reports once through `onError` (`source: "markets"`) and falls back to on-chain reads, instead of a `TypeError` from `lunarMarkets.some` (Sentry MOONWELL-FRONTEND-10J).
- Shared liquidity: a vault record without a `markets` array fails validation with "Invalid shared-liquidity response (vault … has no markets array)" instead of a `TypeError` from the validation loop (Sentry MOONWELL-FRONTEND-116).
- Vault indexer fetches (tokens, vaults, vault, snapshots): a `fetch` that resolves without a `Response` (seen when a wallet extension monkeypatches `window.fetch`) now rejects with "Failed to fetch … from Lunar Indexer: no response" instead of a `TypeError` reading `.ok` on `undefined` (Sentry MOONWELL-FRONTEND-H0 / -133). Non-OK responses keep the existing message.
