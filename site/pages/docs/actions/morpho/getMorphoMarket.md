---
description: Returns the Morpho market.
---

# getMorphoMarket

Returns the Morpho market.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const market = await moonwellClient.getMorphoMarket(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`MorphoMarket`]<!-- /docs/glossary/types#morpho-market -->

A Morpho market.

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