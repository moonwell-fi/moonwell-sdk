---
description: Returns all Morpho user rewards.
---

# getMorphoUserRewards

Returns all Morpho user rewards.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const userRewards = await moonwellClient.getMorphoUserRewards(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoUserReward[]
```

- **Type:** [`MorphoUserReward[]`](/docs/glossary/types#morphouserreward)

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