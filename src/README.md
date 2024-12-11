# Moonwell SDK

<p align="center">
  <a href="https://moonwell.fi">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://avatars.githubusercontent.com/u/96106926?s=200&v=4">
        <img alt="Moonwell Logo" src="https://avatars.githubusercontent.com/u/96106926?s=200&v=4" width="auto" height="60">
      </picture>
</a>
</p>

<p align="center">
  TypeScript Interface for Moonwell
<p>

<p align="center">
  <a href="https://www.npmjs.com/package/@moonwell-fi/moonwell-sdk">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/@moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/v/@moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Version">
    </picture>
  </a>
  <a href="https://github.com/moonwell-fi/moonwell-sdk/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/@moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/l/@moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="MIT License">
    </picture>
  </a>
  <a href="https://www.npmjs.com/package/@moonwell-fi/moonwell-sdk">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/dm/@moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/dm/@moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Downloads per month">
    </picture>
  </a>
</p>

<br>

## Features

- Up-to-date repository of Moonwell deployed contracts
- First-class APIs for interacting with [Moonwell Smart Contracts](https://github.com/moonwell-fi/moonwell-contracts-v2)
- Support for multiple networks: Base, Optimism, Moonbeam, and Moonriver
- Comprehensive market data retrieval
- User position and reward tracking
- Governance functionality
- Morpho integration

## Installation
```bash
npm install @moonwell-fi/moonwell-sdk
# or
yarn add @moonwell-fi/moonwell-sdk
```
## Quick Start
```typescript
// 1. Import modules.
import { createMoonwellClient } from '@moonwell-fi/moonwell-sdk';

// 2. Set up your client with desired networks & RPC urls.
const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://base.llamarpc.com"],
    },
    optimism: {
      rpcUrls: ["https://optimism.llamarpc.com"],
    },
  },
});

// 3. Consume an action!
const markets = await moonwellClient.getMarkets();
```
## Documentation

For detailed documentation and API reference, visit our [SDK Documentation](https://sdk.moonwell.fi/docs/getting-started).

## Supported Networks

- Base
- Optimism
- Moonbeam
- Moonriver

## Key Features

- Market Data: Retrieve comprehensive information about Moonwell markets
- User Positions: Get user positions across all markets or for specific markets
- Rewards: Track user rewards across markets
- Governance: Access proposal data and voting information
- Morpho Integration: Interact with Morpho markets and vaults

## Contributing

We welcome contributions! Please read our [contributing guidelines](/.github/CONTRIBUTING.md) before submitting pull requests.

## Community

Join our community and stay updated:

- Follow [@MoonwellDeFi](https://x.com/MoonwellDeFi) on Twitter
- Join our [Discord](https://discord.gg/moonwellfi)

## License

This project is licensed under the [MIT License](/LICENSE).