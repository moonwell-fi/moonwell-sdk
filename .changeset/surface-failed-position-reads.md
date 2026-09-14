---
"@moonwell-fi/moonwell-sdk": minor
---

**Behavior change:** `getUserPositions`, `getMorphoMarketUserPositions` and `getMorphoVaultUserPositions` now reject when the read fails on any requested chain instead of silently returning a list that is missing that chain's positions. Every chain failure is first reported through the client's `onError` callback with `{ source, chainId }` (sources: `getUserPositions`, `getMorphoMarketUserPositions`, `getMorphoVaultUserPositions`). A single failing chain rethrows the original RPC/contract error; several failing chains reject with an `AggregateError` listing them.

`getUserPosition` and `getMorphoMarketUserPosition` likewise reject on a failed read instead of resolving to `undefined`, and a failed `getUserBalances` / `getUserBorrowsBalances` / `getUserMarketsMemberships` read is no longer treated as an empty balance. Chains without the relevant deployment are still skipped, and an account with no positions still resolves normally.

Consumers that treated an empty array as "no positions" should now handle the rejection (for example, keep the last good data in a query cache). This fixes a Base RPC failure being shown as a `$0.00` credit limit and disabled borrow confirmation in isolated markets (MOO-884, MOO-885).
