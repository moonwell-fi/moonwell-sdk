---
description: Returns the user vote receipt.
---

# getUserVoteReceipt

Returns the user vote receipt.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const receipt = await moonwellClient.getUserVoteReceipt(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
VoteReceipt[]
```

- **Type:** [`VoteReceipt[]`](/docs/glossary/types#votereceipt)

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