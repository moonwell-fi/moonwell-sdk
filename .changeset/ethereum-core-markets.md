---
"@moonwell-fi/moonwell-sdk": minor
---

Add Moonwell Core lending on Ethereum mainnet. The Ethereum environment now registers the 4 launch mTokens — mWETH, mUSDC, mUSDT, mcbBTC — along with their underlyings (WETH, USDT, cbBTC; USDC was already present). `getMarkets()` returns Ethereum entries sourced from the Lunar Indexer (`chainId=1`) where it previously returned nothing for chain 1, and `MarketsType<EthereumEnvironment>` resolves to the new market keys instead of `undefined`. Consumers iterating `keyof MarketsType<...>` over Ethereum will now see the 4 markets.
