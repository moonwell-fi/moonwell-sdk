---
"@moonwell-fi/moonwell-sdk": patch
---

Skip malformed Lunar indexer market records instead of rejecting the whole chain's market list. A record with missing numeric fields produced `NaN`, which `BigInt()` rejects with a RangeError that previously took down every market on the chain (observed chain-wide on the sunset Moonbeam deployment). Valid records are now kept; when every record is malformed, `getMarketsData` reports one aggregate error and falls back to on-chain reads.
