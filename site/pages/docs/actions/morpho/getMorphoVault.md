---
description: Returns the Morpho vault.
---

# getMorphoVault

Returns the Morpho vault.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const vault = await moonwellClient.getMorphoVault(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`MorphoVault`]<!-- /docs/glossary/types#morpho-vault -->

A Morpho vault.

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