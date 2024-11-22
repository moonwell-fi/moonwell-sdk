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

[`MorphoMarketUserPosition`]<!-- /docs/glossary/types#morpho-market-user-position -->

A Morpho market user position.

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