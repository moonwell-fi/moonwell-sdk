---
description: Returns all proposals.
---

# getProposals

Returns all proposals.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const proposals = await moonwellClient.getProposals(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`Proposal[]`]<!-- /docs/glossary/types#proposal -->

A list of proposals.

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