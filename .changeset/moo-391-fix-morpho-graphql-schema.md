---
"@moonwell-fi/moonwell-sdk": patch
---

Fix Morpho GraphQL queries broken by upstream API schema changes. The Morpho API renamed `Market.uniqueKey` to `marketId` and replaced `PublicAllocatorSharedLiquidity.allocationMarket` with `withdrawMarket`, causing the rewards and shared-liquidity queries to fail with 400 errors that were silently swallowed — every Morpho vault reported empty rewards (MOO-391). Also migrates vault rewards to `state.allRewards` and drops the deprecated `amountPerSuppliedToken`/`amountPerBorrowedToken` fields ahead of their removal (reward token amounts are now reported as 0 since the API no longer exposes them), and logs Morpho GraphQL errors in non-browser environments so failures surface in server logs.
