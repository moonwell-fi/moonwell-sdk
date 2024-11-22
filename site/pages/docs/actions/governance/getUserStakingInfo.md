---
description: Returns the user staking info.
---

# getUserStakingInfo

Returns the user staking info.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const info = await moonwellClient.getUserStakingInfo(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
UserStakingInfo[]
```

- **Type:** [`UserStakingInfo[]`](/docs/glossary/types#userstakinginfo)

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