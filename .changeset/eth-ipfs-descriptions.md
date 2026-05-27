---
"@moonwell-fi/moonwell-sdk": minor
---

Resolve Eth multigov proposal descriptions from IPFS via Pinata. The lunar indexer now surfaces these as `ipfs://<hash>` URIs; the SDK fetches and substitutes the plaintext markdown before subtitle extraction so consumers see resolved descriptions. On per-proposal IPFS fetch failure the `ipfs://` URI is left in place — frontend consumers can detect this with `description.startsWith("ipfs://")` if they want to show a fallback.
