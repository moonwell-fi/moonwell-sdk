---
description: Returns all Morpho markets.
---

# getMorphoMarkets

Returns all Morpho markets.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const markets = await moonwellClient.getMorphoMarkets(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoMarket[]
```

- **Type:** [`MorphoMarket[]`](/docs/glossary/types#morphomarket)

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