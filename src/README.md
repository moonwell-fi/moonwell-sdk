
<p align="center">
  <a href="https://viem.sh">
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
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/v/@moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Version">
    </picture>
  </a>
  <a href="https://app.codecov.io/gh/moonwell-fi/moonwell-sdk">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/codecov/c/github/moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Code coverage">
    </picture>
  </a>
  <a href="https://github.com/moonwell-fi/moonwell-sdk/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/l/moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="MIT License">
    </picture>
  </a>
  <a href="https://www.npmjs.com/package/@moonwell-fi/moonwell-sdk">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/dm/moonwell-fi/moonwell-sdk?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/dm/moonwell-fi/moonwell-sdk?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Downloads per month">
    </picture>
  </a>
  <a href="https://bestofjs.org/projects/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/endpoint?colorA=21262d&colorB=21262d&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=moonwell-fi%2Fmoonwell-sdk%26since=daily">
      <img src="https://img.shields.io/endpoint?colorA=f6f8fa&colorB=f6f8fa&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=moonwell-fi%2Fmoonwell-sdk%26since=daily" alt="Best of JS">
    </picture>
  </a>
</p>

<br>

## Features

- Up-to-date repository of Moonwell deployed contracts
- First-class APIs for interacting with [Moonwell Smart Contracts](https://github.com/moonwell-fi/moonwell-contracts-v2)

## Overview

```ts
// 1. Import modules.
import { createMoonwellClient, base, optimism } from '@moonwell-fi/moonwell-sdk';

// 2. Set up your client with desired networks & RPC urls.
const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      chain: base,
      rpcUrls: ["https://base.llamarpc.com"],
    },
    optimism: {
      chain: optimism,
      rpcUrls: ["https://optimism.llamarpc.com"],
    },
  },
});

// 3. Consume an action!
const markets = await moonwellClient.getMarkets();
```

## Documentation

[Head to the documentation](https://moonwell.fi/docs/getting-started) to read and learn more about Moonwell SDK.

## Community

Check out the following places for more Moonwell content:

- Follow [@MoonwellDeFi](https://x.com/MoonwellDeFi), [@LukeYoungblood](https://x.com/LukeYoungblood), and [@x0s0l](https://x.com/x0s0l) on Twitter for project updates

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

## Authors

- [@x0s0l](https://github.com/x0s0l) (x0s0l.eth, [X](https://x.com/x0s0l))

## License

[MIT](/LICENSE) License