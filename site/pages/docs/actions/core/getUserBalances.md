---
description: Returns user balances.
---

# getUserBalances

Returns user balances.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const balances = await moonwellClient.getUserBalances(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
UserBalance[]
```

- **Type:** [`UserBalance[]`](/docs/glossary/types#user-balance)

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