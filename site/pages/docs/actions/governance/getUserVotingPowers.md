---
description: Returns the user voting powers.
---

# getUserVotingPowers

Returns the user voting powers.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const powers = await moonwellClient.getUserVotingPowers(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
UserVotingPowers[]
```

- **Type:** [`UserVotingPowers[]`](/docs/glossary/types#uservotingpowers)

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