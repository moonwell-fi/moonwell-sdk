---
"@moonwell-fi/moonwell-sdk": patch
---

Skip malformed Lunar indexer market records instead of rejecting the whole chain's market list. A record with missing numeric fields produced `NaN`, which `BigInt()` rejects with a RangeError that previously took down every market on the chain (observed chain-wide on the sunset Moonbeam deployment). Valid records are now kept; when every record is malformed, `getMarketsData` reports one aggregate error and falls back to on-chain reads.

Every numeric field is validated on the way in, not just the ones that reach `BigInt()`. `totalSupplyUsd`, `priceUsd`, the caps, `collateralFactor` and the APYs went through a plain `Number()`, so a dropped field used to land in the returned `Market` as `NaN` and silently poison any aggregate built from it — a single bad record turned a chain's summed TVL into `NaN` with no error raised anywhere. Those records are now skipped and reported like any other malformed record, and the error names the offending field.

A malformed *incentive* costs only its own reward entry — the market is still returned with its remaining rewards — rather than discarding the whole record, so a rewards-only indexer incident degrades APRs instead of emptying the chain.

Skipped records and skipped incentives are reported through `onError` with the `markets-malformed-records` and `markets-malformed-incentives` sources. A partial incident returns successfully, so without this it left no trace beyond a console warning.
