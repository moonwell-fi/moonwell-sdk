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

[`UserVoteReceipt`]<!-- /docs/glossary/types#user-vote-receipt -->

A user vote receipt.

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