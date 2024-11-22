---
description: Returns all snapshot proposals.
---

# getSnapshotProposals

Returns all snapshot proposals.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const proposals = await moonwellClient.getSnapshotProposals(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

[`Proposals`]<!-- /docs/glossary/types#snapshot-proposal -->

A list of snapshot proposals.

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