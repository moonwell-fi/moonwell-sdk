---
description: Returns all Morpho vault snapshots.
---

# getMorphoVaultSnapshots

Returns all Morpho vault snapshots.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const vaultSnapshots = await moonwellClient.getMorphoVaultSnapshots(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
MorphoVaultSnapshot[]
```

- **Type:** [`MorphoVaultSnapshot[]`](/docs/glossary/types#morphovaultsnapshot)

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