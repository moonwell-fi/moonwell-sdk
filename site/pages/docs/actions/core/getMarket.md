---
description: Returns the market.
---

# getMarket

Returns the market.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const market = await moonwellClient.getMarket(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`Market`]<!-- /docs/glossary/types#market -->

A market.

<!-- ## Parameters

### includeLiquidStakingRewards

- **Type:** `boolean`

Whether to include liquid staking rewards in the response.

```ts twoslash
// [!include ~/snippets/moonClient.ts]
// ---cut---
const market = await moonwellClient.getMarket({
  includeLiquidStakingRewards: true // [!code focus]
})
``` -->