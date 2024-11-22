---
description: Returns all discussions.
---

# getDiscussions

Returns all discussions.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const discussions = await moonwellClient.getDiscussions(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
Discussion[]
```

- **Type:** [`Discussion[]`](/docs/glossary/types#discussion)

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