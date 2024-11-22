---
description: Returns all Morpho user balances.
---

# getMorphoUserBalances

Returns all Morpho user balances.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const balances = await moonwellClient.getMorphoUserBalances(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`MorphoUserBalance[]`]<!-- /docs/glossary/types#morpho-user-balance -->

A list of Morpho user balances.

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