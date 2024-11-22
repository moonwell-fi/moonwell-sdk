---
description: Returns the Morpho vault user position.
---

# getMorphoVaultUserPosition

Returns the Morpho vault user position.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const vaultUserPosition = await moonwellClient.getMorphoVaultUserPosition(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoVaultUserPosition | undefined
```

- **Type:** [`MorphoVaultUserPosition`](/docs/glossary/types#morphovaultuserposition)

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