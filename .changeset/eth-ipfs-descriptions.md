---
"@moonwell-fi/moonwell-sdk": minor
---

Resolve Eth multigov proposal descriptions from IPFS via Pinata. The lunar indexer now surfaces these as `ipfs://<hash>` URIs; the SDK fetches and substitutes the plaintext markdown before subtitle extraction so consumers see resolved descriptions. Per-proposal fetch failures are routed through `env.onError` (matching `getProposalData` / `getExtendedProposalData`) and the `ipfs://` URI is left in place — frontend consumers can detect this with `description.startsWith("ipfs://")` if they want to show a fallback. Non-string gateway responses are rejected explicitly so they don't poison the in-memory cache.
