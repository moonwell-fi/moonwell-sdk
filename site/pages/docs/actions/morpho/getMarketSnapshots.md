---
description: Returns all Morpho market snapshots.
---

# getMarketSnapshots

Returns all Morpho market snapshots.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const marketSnapshots = await moonwellClient.getMarketSnapshots(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MarketSnapshot[]
```

- **Type:** [`MarketSnapshot[]`](/docs/glossary/types#marketsnapshot)

<!-- ## Parameters

### includeLiquidStakingRewards

- **Type:** `boolean`

Whether to include liquid staking rewards in the response.

```ts twoslash
// [!include ~/snippets/moonClient.ts]
// ---cut---
const markets = await moonwellClient.getMarkets({
  includeLiquidStakingRewards: true // [!code focus]
})
``` -->