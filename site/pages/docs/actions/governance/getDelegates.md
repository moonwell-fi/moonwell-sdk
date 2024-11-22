---
description: Returns all delegates.
---

# getDelegates

Returns all delegates.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const delegates = await moonwellClient.getDelegates(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
Delegate[]
```

- **Type:** [`Delegate[]`](/docs/glossary/types#delegate)

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