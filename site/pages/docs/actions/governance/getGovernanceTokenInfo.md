---
description: Returns the governance token info.
---

# getGovernanceTokenInfo

Returns the governance token info.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const info = await moonwellClient.getGovernanceTokenInfo(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

`{ totalSupply: Amount } | undefined`

A governance token info.

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