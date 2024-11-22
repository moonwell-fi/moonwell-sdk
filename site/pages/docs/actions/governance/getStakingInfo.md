---
description: Returns the staking info.
---

# getStakingInfo

Returns the staking info.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const info = await moonwellClient.getStakingInfo(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`StakingInfo`]<!-- /docs/glossary/types#staking-info -->

A staking info.

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