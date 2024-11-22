---
description: Returns all user positions.
---

# getUserPositions

Returns all user positions.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const positions = await moonwellClient.getUserPositions(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
UserPosition[]
```

- **Type:** [`UserPosition[]`](/docs/glossary/types#userposition)

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