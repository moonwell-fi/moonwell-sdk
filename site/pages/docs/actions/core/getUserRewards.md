---
description: Returns all user rewards.
---

# getUserRewards

Returns all user rewards.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const rewards = await moonwellClient.getUserRewards(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
UserReward[]
```

- **Type:** [`UserReward[]`](/docs/glossary/types#userreward)

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