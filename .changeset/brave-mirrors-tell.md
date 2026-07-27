---
"@moonwell-fi/moonwell-sdk": patch
---

Removed the dead Ponder indexer fetches. `getStakingSnapshots`, `getCirculatingSupplySnapshots`, `getMarketSnapshots` (core), and `getUserPositionSnapshots` now return `[]` for environments without a `lunarIndexerUrl` (Moonriver) instead of querying the decommissioned Ponder API. No public type changes — the deprecated `Environment.indexerUrl` field remains for now and its removal is tracked separately (MOO-537).
