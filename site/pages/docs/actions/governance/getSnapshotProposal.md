---
description: Returns the snapshot proposal.
---

# getSnapshotProposal

Returns the snapshot proposal.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const proposal = await moonwellClient.getSnapshotProposal(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
SnapshotProposal | undefined
```

- **Type:** [`SnapshotProposal`](/docs/glossary/types#snapshotproposal)

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