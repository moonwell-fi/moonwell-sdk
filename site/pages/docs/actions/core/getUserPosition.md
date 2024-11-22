---
description: Returns user position.
---

# getUserPosition

Returns user position.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const position = await moonwellClient.getUserPosition(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`UserPosition`]<!-- /docs/glossary/types#user-position -->

A user position.

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