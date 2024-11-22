---
description: Returns all staking snapshots.
---

# getStakingSnapshots

Returns all staking snapshots.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const snapshots = await moonwellClient.getStakingSnapshots(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
StakingSnapshot[]
```

- **Type:** [`StakingSnapshot[]`](/docs/glossary/types#stakingsnapshot)


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