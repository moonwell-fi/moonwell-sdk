---
description: Returns user reward.
---

# getUserReward

Returns user reward.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const reward = await moonwellClient.getUserReward(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`UserReward`]<!-- /docs/glossary/types#user-reward -->

A user reward.

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