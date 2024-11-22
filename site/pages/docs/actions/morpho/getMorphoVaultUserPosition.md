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

[`MorphoVaultUserPosition`]<!-- /docs/glossary/types#morpho-vault-user-position -->

A Morpho vault user position.

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