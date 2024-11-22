---
description: Returns the all markets available on Moonwell.
---

# getMarkets

Returns the all markets available on Moonwell.

## Usage

:::code-group

```ts twoslash [example.ts]
import { moonwellClient } from './client'

const markets = await moonwellClient.getMarkets(); // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/moonClient.ts]
```

:::

## Returns

```
Market[]
```

- **Type:** [`Market[]`](/docs/glossary/types#market)

## Parameters

### includeLiquidStakingRewards

- **Type:** `boolean`

Whether to include liquid staking rewards in the response.

```ts twoslash
// [!include ~/snippets/moonClient.ts]
// ---cut---
const markets = await moonwellClient.getMarkets({
  includeLiquidStakingRewards: true // [!code focus]
})
```

<!-- ### blockNumber (optional)

- **Type:** `bigint`

The balance of the account at a block number.

```ts twoslash
// [!include ~/snippets/moonClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

The balance of the account at a block tag.

```ts twoslash
// [!include ~/snippets/moonClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
``` -->