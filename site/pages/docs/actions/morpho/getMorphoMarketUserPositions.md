---
description: Returns all Morpho market user positions.
---

# getMorphoMarketUserPositions

Returns all Morpho market user positions.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const marketUserPositions = await moonwellClient.getMorphoMarketUserPositions(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`MorphoMarketUserPosition[]`]<!-- /docs/glossary/types#morpho-market-user-position -->

A list of Morpho market user positions.

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