---
"@moonwell-fi/moonwell-sdk": patch
---

Load the Beam quote implementation (`@biconomy/abstractjs`, `@across-protocol/app-sdk`) on the first `getBeamQuote` call instead of when the client is created, so apps that never request a Beam quote no longer ship those SDKs in their initial bundle.
