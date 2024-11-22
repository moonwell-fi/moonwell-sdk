---
description: Returns the Morpho market user position.
---

# getMorphoMarketUserPosition

Returns the Morpho market user position.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const marketUserPosition = await moonwellClient.getMorphoMarketUserPosition(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoMarketUserPosition | undefined
```

- **Type:** [`MorphoMarketUserPosition`](/docs/glossary/types#morphomarketuserposition)

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