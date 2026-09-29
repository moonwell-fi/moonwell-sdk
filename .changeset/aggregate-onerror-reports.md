---
"@moonwell-fi/moonwell-sdk": minor
---

**Behavior change:** batched reads now report failures through `onError` once per operation instead of once per item. viem batches these reads into a single multicall, so one failed request used to fan out into dozens of events (Sentry MOONWELL-FRONTEND-1AX: ~226 events per session).

`OnErrorContext` gains the optional fields `operation`, `failedCount`, `totalCount` and `items` (the failed proposalIds, token addresses, vault keys or requesting chainIds). Existing fields are unchanged.

- `getProposals` / `getProposal`: governor `state` / `proposals` read failures are reported once per chain (`source: "governance-proposals"`, `operation: "proposal-onchain-read"`). The API-derived state fallback is unchanged.
- `getUserBalances`: failed token reads are reported once per chain (`source: "user-balances-token-read"`, `operation: "token-balance-read"`). `token` is still set when exactly one token failed.
- `getGovernanceTokenPriceFor`: concurrent calls reading through the same price-source environment (the Base environment for every WELL chain) share one in-flight read, and a successful price is reused for 10 seconds; failures are never cached. Environments with different RPC configurations never share a read. A failed read is reported once per `onError` callback, with `chainId` set to the price source chain and `items` listing the requesting chainIds.
- `getMorphoVaults({ includeRewards: true })`: staking-reward prices are read once per environment (in parallel across environments) instead of sequentially per vault. Price and per-vault reward failures, previously only logged with `console.warn`, are now reported once per environment (`source: "morpho-vault-staking-rewards"`).
- `getMorphoVaults`: a malformed Lunar Indexer vault record no longer takes down the chain's whole vault list (Sentry MOONWELL-FRONTEND-GX). A vault missing `markets` / `rewards` is kept with empty lists; a vault that cannot be built at all is dropped. Both are reported once per chain (`source: "vaults"`, `operation: "malformed-vault-records"`, `items`: vault addresses).
- Shared liquidity: when the SDK's own deadline (15s by default, `timeoutMs`) aborts the request, it now rejects and reports an `Error` named `TimeoutError` ("Shared-liquidity request timed out after …ms", original `CanceledError` as `cause`) instead of a bare `CanceledError: canceled` (Sentry MOONWELL-FRONTEND-1C7/1C8/1CA/1CN/1CS). An abort from the caller's `signal` still rejects with the `CanceledError` and is not reported.
- Shared liquidity: "Invalid shared-liquidity response" now says what was received (body type, size or top-level keys) to diagnose Sentry MOONWELL-FRONTEND-1C5. Validation is unchanged.

`getProposals` accepts an optional `proposalChainIds` (e.g. `[1]`) to fetch only some governance chains. The Moonbeam/Moonriver archives are ~6.6MB of the ~7MB full history, so views that only show recent proposals can skip them. The default is unchanged (all chains).
