---
"@moonwell-fi/moonwell-sdk": minor
---

`getUserBalances` no longer reports a failed balance read as a zero balance (MOO-832). Previously an RPC failure on a single `balanceOf` / `getBalance` call resolved to `{ amount: 0n }`, so consumers received a "successful" response in which a funded wallet read as empty — the Moonwell frontend gates repay-all on that figure, and one transient RPC hiccup during a refetch left the confirm button disabled for 59 users (Sentry MOONWELL-FRONTEND-195).

A token whose read fails is now **omitted** from the result — an absent entry means the balance is unknown, a `0n` entry means the wallet is genuinely empty — and the failure is routed to `environment.onError` with `source: "user-balances-token-read"` (plus `chainId` and `token`). Per-chain and views-multicall fallback behavior is unchanged. Consumers that index the result by token should treat a missing entry as "could not be determined" rather than as zero.
