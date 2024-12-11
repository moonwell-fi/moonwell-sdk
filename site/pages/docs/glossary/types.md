# Types [Glossary of Types in moonwell-sdk]

## `Market`

Represents a lending/borrowing market in the Moonwell protocol, containing information such as interest rates, total supply, total borrow, and other market-specific metrics.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/market.ts)

## `UserBalance`

Contains information about a user's token balances, including wallet balance, allowance, and other token-specific balance information.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/userBalance.ts)

## `UserPosition`

Represents a user's position in a specific market, including their supplied and borrowed amounts, collateral status, and other position-specific details.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/userPosition.ts)

## `UserReward`

Contains information about rewards earned by a user from various protocol activities, including reward rates and accrued amounts.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/userReward.ts)

## `Proposal`

Represents a governance proposal in the Moonwell protocol, including proposal details, voting status, and execution information.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/proposal.ts)

## `SnapshotProposal`

Contains information about off-chain governance proposals created through Snapshot, including proposal content and voting parameters.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/snapshotProposal.ts)

## `Delegate`

Represents delegation information, including delegator and delegate addresses and voting power.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/delegate.ts)

## `Discussion`

Contains information about governance-related discussions, including discussion content, participants, and metadata.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/discussion.ts)

## `Amount`

A utility class for handling token amounts with precision, providing methods for mathematical operations and conversions between different decimal representations.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/common/amount.ts)

## `StakingInfo`

Contains global staking information for the protocol, including total staked amounts, reward rates, and other staking parameters.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/staking.ts)

## `StakingSnapshot`

Represents a point-in-time snapshot of staking metrics, useful for historical analysis and tracking changes over time.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/staking.ts)

## `UserStakingInfo`

Contains information about a specific user's staking position, including staked amounts, unclaimed rewards, and other user-specific staking details.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/staking.ts)

## `VoteReceipt`

Records information about a user's vote on a governance proposal, including voting power used and voting direction.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/voteReceipt.ts)

## `UserVotingPowers`

Contains information about a user's voting power across different governance mechanisms, including delegated and received voting power.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/userVotingPowers.ts)

## `CirculatingSupplySnapshot`

Represents a point-in-time snapshot of token circulating supply metrics, useful for tracking token distribution and supply changes.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/circulatingSupply.ts)

## `MarketSnapshot`

Contains a point-in-time snapshot of market metrics, including interest rates, total supply, total borrow, and other market parameters.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/market.ts)

## `MorphoMarket`

Represents a market in the Morpho protocol integration, containing market-specific parameters and states for optimized lending.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoMarket.ts)

## `MorphoMarketUserPosition`

Contains information about a user's position in a Morpho market, including supplied and borrowed amounts through the Morpho protocol.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoUserPosition.ts)

## `MorphoUserReward`

Represents rewards earned by a user through participation in Morpho markets, including reward rates and accrued amounts.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoUserReward.ts)

## `MorphoVault`

Contains information about a Morpho vault, including vault parameters, total deposits, and other vault-specific metrics.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoVault.ts)

## `MorphoVaultSnapshot`

Represents a point-in-time snapshot of Morpho vault metrics, useful for tracking vault performance and changes over time.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoVault.ts)

## `MorphoVaultUserPosition`

Contains information about a user's position in a Morpho vault, including deposited amounts and other position-specific details.

[See Type](https://github.com/moonwell-fi/moonwell-sdk/blob/main/src/types/morphoUserPosition.ts)
