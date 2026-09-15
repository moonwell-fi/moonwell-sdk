---
"@moonwell-fi/moonwell-sdk": minor
---

**Behavior change:** `getUserPositions`, `getMorphoMarketUserPositions` and `getMorphoVaultUserPositions` now reject when the read fails on any requested chain instead of silently returning a list that is missing that chain's positions. The rejection is a new exported `ChainReadError` (an `AggregateError` subclass) whose `failures` lists every failed chain as `{ chainId, reason }` with the original RPC/contract error, and whose `data` carries the positions from the chains that did succeed, so a consumer can keep rendering the healthy chains while flagging the broken one.

These failures are surfaced only through the rejection. They are **not** also reported through the client's `onError` callback, so a consumer that retries the call is not told about the same outage once per attempt per chain; report the rejection where you handle it.

`getUserPosition`, `getMorphoMarketUserPosition` and `getMorphoVaultUserPosition` likewise reject on a failed read (with the original error, since they read a single chain) instead of resolving to `undefined`. A failed `getUserBalances` / `getUserBorrowsBalances` / `getUserMarketsMemberships` read is no longer treated as an empty balance. When only `getAllMarketsInfo` fails and positions are computed through the per-mToken fallback (USD values reported as `0`), that failure is now reported through `onError` with `source: "user-positions-oracle-fallback"`. Chains without the relevant deployment are still skipped, and an account with no positions still resolves normally.

Consumers that treated an empty array as "no positions" should now handle the rejection. With TanStack Query: keep the last good result with `placeholderData: keepPreviousData`, gate the empty state on `isError` rather than on `data === undefined`, read partial results from `error.data` when `error instanceof ChainReadError`, and consider a lower `retry` for these queries since every attempt re-reads the healthy chains too. This fixes a Base RPC failure being shown as a `$0.00` credit limit and disabled borrow confirmation in isolated markets (MOO-884, MOO-885).
