---
"@moonwell-fi/moonwell-sdk": minor
---

Add Moonwell Core lending on Ethereum mainnet. The Ethereum environment now registers the 4 launch mTokens — mWETH, mUSDC, mUSDT, mcbBTC — along with their underlyings (WETH, USDT, cbBTC; USDC was already present). `getMarkets()` returns Ethereum entries sourced from the Lunar Indexer (`chainId=1`) where it previously returned nothing for chain 1, and `MarketsType<EthereumEnvironment>` resolves to the new market keys instead of `undefined`. Consumers iterating `keyof MarketsType<...>` over Ethereum will now see the 4 markets.

`MOONWELL_WETH.underlyingToken` is registered as `"ETH"` (native, `zeroAddress`) — mirroring the Base / Optimism convention where the on-chain `mToken.underlying()` returns WETH but the SDK config presents the market as native ETH so the frontend mWETHRouter can wrap on supply and unwrap on withdraw. Also wires `wrappedNativeToken: "WETH"` and a `router` entry on the Ethereum contracts config for the same purpose.
