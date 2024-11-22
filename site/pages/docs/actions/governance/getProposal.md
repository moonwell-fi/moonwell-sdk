---
description: Returns the proposal.
---

# getProposal

Returns the proposal.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const proposal = await moonwellClient.getProposal(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
Proposal | undefined
```

- **Type:** [`Proposal`](/docs/glossary/types#proposal)

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