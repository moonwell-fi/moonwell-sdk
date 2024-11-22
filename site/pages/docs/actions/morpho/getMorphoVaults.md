---
description: Returns all Morpho vaults.
---

# getMorphoVaults

Returns all Morpho vaults.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const vaults = await moonwellClient.getMorphoVaults(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`MorphoVault[]`]<!-- /docs/glossary/types#morpho-vault -->

A list of Morpho vaults.

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