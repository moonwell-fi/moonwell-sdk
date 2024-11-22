---
description: Returns all circulating supply snapshots.
---

# getCirculatingSupplySnapshots

Returns all circulating supply snapshots.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const snapshots = await moonwellClient.getCirculatingSupplySnapshots(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`CirculatingSupplySnapshot[]`]<!-- /docs/glossary/types#circulating-supply-snapshot -->

A list of circulating supply snapshots.

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