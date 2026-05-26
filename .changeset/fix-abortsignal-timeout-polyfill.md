---
"@moonwell-fi/moonwell-sdk": patch
---

fix(morpho): replace AbortSignal.timeout with cross-browser timeoutSignal helper

`AbortSignal.timeout` was introduced in Chrome 103, Firefox 100, and Safari 15.4.
Older browsers — notably Chrome Mobile 98 / Android 7.0 — that some Moonwell users
still run do not support it. This surfaced as:

  TypeError: AbortSignal.timeout is not a function

when the Morpho vault fetch utilities (`getMorphoVaults`, `getGraphQL`) tried to
set a request timeout, crashing the vaults page entirely on affected devices.

Adds `src/common/abort-signal.ts` with `timeoutSignal(ms)` — a safe drop-in
replacement that delegates to the native `AbortSignal.timeout` when available and
falls back to `AbortController + setTimeout` on older environments.

All six fetch sites in `graphql.ts` (2) and `lunarIndexerTransform.ts` (4) are
updated to call `timeoutSignal` instead of `AbortSignal.timeout` directly.

Fixes Sentry issue MOONWELL-FRONTEND-RQ.
