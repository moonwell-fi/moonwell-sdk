## Simple Example for Base Chain Users

Moonwell is awesome on Base for low fees! Here's a beginner-friendly way to get markets on Base:

```ts
import { createMoonwellClient } from '@moonwell-fi/moonwell-sdk';

const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://mainnet.base.org"],  // Public Base RPC
    },
  },
});

async function getBaseMarkets() {
  const markets = await moonwellClient.getMarkets('base');  // Specify 'base' network
  console.log('Moonwell Markets on Base:', markets);
}

getBaseMarkets();
## Simple Example for Base Chain Users (Beginner-Friendly)

Moonwell shines on Base for low fees and Coinbase ties! Here's an easy way to fetch markets on Base using a public RPC:

```ts
import { createMoonwellClient } from '@moonwell-fi/moonwell-sdk';

const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://mainnet.base.org"],  // Free public Base RPC
    },
  },
});

async function getBaseMarkets() {
  const markets = await moonwellClient.getMarkets('base');  // Get all markets on Base
  console.log('Moonwell Markets on Base:', markets);
}

getBaseMarkets();
