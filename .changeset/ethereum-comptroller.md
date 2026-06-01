---
"@moonwell-fi/moonwell-sdk": patch
---

Wire the Ethereum mainnet Unitroller (`0xdec80bb934397575594e91970b37baf65f5b21be`) as `contracts.comptroller` on the Ethereum environment. Consumers can now call `enterMarkets` / `exitMarket` for the 4 Core markets — without this, the frontend's "Enable as collateral" modal built its `useTransaction` against an undefined contract address, which caused the confirm button to silently no-op (no wallet prompt, no toast, no console error).
