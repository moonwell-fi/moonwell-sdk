# Remove Goldsky Subgraph Dependency

## Context

The codebase uses Goldsky-hosted subgraphs (`moonwell-morpho-blue-optimism` and `moonwell-morpho-blue-base`) for two features. We want to eliminate this dependency entirely, migrating one feature to the lunar indexer and removing the other (a fallback path).

## Scope of Change

### What uses the subgraph today

| Call site | File | Purpose | Chains |
|---|---|---|---|
| `getMorphoMarketPublicAllocatorSharedLiquidity` | `src/actions/morpho/markets/common.ts:422-700` | Fetches MetaMorpho vault public allocator flow caps & reallocatable liquidity | Both (Base + Optimism) |
| `fetchIsolatedMarketSnapshotsSubgraph` | `src/actions/core/markets/getMarketSnapshots.ts:821-960` | Fallback for daily market snapshots when lunar indexer fails (only reached when `minimalDeployment !== false`) | Optimism only |

### Dependencies

- **Goldsky URLs** defined in:
  - `src/environments/definitions/optimism/custom.ts` (line 7)
  - `src/environments/definitions/base/custom.ts`
- **`getSubgraph` function** in `src/actions/morpho/utils/graphql.ts:42-84`
- **`subgraphUrl` type** in `src/environments/types/config.ts:140`

## Plan

### 1. Migrate public allocator shared liquidity to lunar indexer

This requires a **backend change** to the lunar indexer service (separate task). In the SDK:

- Add a new fetch function `fetchPublicAllocatorSharedLiquidityFromIndexer` in `src/actions/morpho/markets/lunarIndexerTransform.ts` following the existing pattern (GET request to a new endpoint like `/api/v1/isolated/markets/{chainId}/shared-liquidity`)
- Add a transform function to map the indexer response to the existing `PublicAllocatorSharedLiquidityType[]`
- Update `getMorphoMarketPublicAllocatorSharedLiquidity` in `common.ts` to call the lunar indexer instead of the subgraph
- Keep a graceful fallback (return `[]`) if the endpoint isn't available yet

### 2. Remove the subgraph market snapshots fallback

- Delete `fetchIsolatedMarketSnapshotsSubgraph` from `getMarketSnapshots.ts` (lines 821-960)
- Update the branching logic at line 578-594: remove the `minimalDeployment === false` gate so **all chains** fall back to the Blue API path (`fetchIsolatedMarketSnapshotsFromBlueApi`) when the lunar indexer fails
- The lunar indexer is already the primary path; this just replaces a stale subgraph fallback with the Blue API

### 3. Remove subgraph infrastructure

- Delete `getSubgraph` function from `src/actions/morpho/utils/graphql.ts` (lines 42-84)
- Remove `subgraphUrl` from both environment configs:
  - `src/environments/definitions/optimism/custom.ts`
  - `src/environments/definitions/base/custom.ts`
- Remove `subgraphUrl` from the type definition in `src/environments/types/config.ts` (line 140)

### 4. Cleanup imports

- Remove `getSubgraph` imports from:
  - `src/actions/morpho/markets/common.ts`
  - `src/actions/core/markets/getMarketSnapshots.ts`

## Files to modify

| File | Change |
|---|---|
| `src/actions/morpho/markets/common.ts` | Replace subgraph call with lunar indexer call |
| `src/actions/core/markets/getMarketSnapshots.ts` | Remove subgraph fallback, use Blue API for all chains |
| `src/actions/morpho/utils/graphql.ts` | Delete `getSubgraph` function |
| `src/actions/morpho/markets/lunarIndexerTransform.ts` | Add new fetch/transform for shared liquidity |
| `src/environments/definitions/optimism/custom.ts` | Remove `subgraphUrl` |
| `src/environments/definitions/base/custom.ts` | Remove `subgraphUrl` |
| `src/environments/types/config.ts` | Remove `subgraphUrl` from type |

## Backend dependency

The lunar indexer needs a new endpoint to serve public allocator shared liquidity data. The data currently comes from the Goldsky subgraph query which fetches:

- MetaMorpho vaults with `hasPublicAllocator: true`
- Public allocator fee and flow caps (maxIn/maxOut per market)
- Vault positions (supplier balances per market)
- Market metadata (oracle, IRM, LLTV, token info, supply/borrow/collateral totals)

This data is used to calculate reallocatable liquidity for each Morpho market.

## Verification

1. `pnpm tsc --noEmit` — no type errors
2. `pnpm lint` — no lint errors
3. `pnpm test` — all tests pass
4. `pnpm build` — clean build
5. Grep for `subgraph` / `getSubgraph` / `goldsky` to confirm no remaining references
