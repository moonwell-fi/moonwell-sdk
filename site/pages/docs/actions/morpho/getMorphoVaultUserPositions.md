---
description: Returns all Morpho vault user positions.
---

# getMorphoVaultUserPositions

Returns all Morpho vault user positions.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const vaultUserPositions = await moonwellClient.getMorphoVaultUserPositions(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoVaultUserPosition[]
```

- **Type:** [`MorphoVaultUserPosition[]`](/docs/glossary/types#morphovaultuserposition)

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