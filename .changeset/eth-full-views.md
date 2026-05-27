---
"@moonwell-fi/moonwell-sdk": minor
---

Wire the full Ethereum CoreViews contract (`0xA061Ed814bBd1b03e8df0B7AbEbc40f4A6feb895`), replacing the staking-only proxy, and expose the Ethereum MultichainGovernor (`0x8769B70ac7c93AF0e75de0D69877709B66d75838`) so consumers can cast votes on Eth-side proposals. `getUserVotingPowers` and `getDelegates` now include Ethereum mainnet alongside Moonbeam, Base, and Optimism.
