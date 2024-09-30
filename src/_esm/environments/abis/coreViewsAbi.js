export default [
    {
        type: "function",
        name: "comptroller",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract Comptroller",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getAllMarketsInfo",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Market[]",
                components: [
                    {
                        name: "market",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "isListed",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "mintPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "collateralFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "underlyingPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalBorrows",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalReserves",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "cash",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "exchangeRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowIndex",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "reserveFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "incentives",
                        type: "tuple[]",
                        internalType: "struct BaseMoonwellViews.MarketIncentives[]",
                        components: [
                            {
                                name: "token",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "supplyIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "borrowIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getAllVaultsInfo",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.MorphoVault[]",
                components: [
                    {
                        name: "vault",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "underlyingPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "fee",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "timelock",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "markets",
                        type: "tuple[]",
                        internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo[]",
                        components: [
                            {
                                name: "marketId",
                                type: "bytes32",
                                internalType: "Id",
                            },
                            {
                                name: "marketCollateral",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "marketCollateralName",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "marketCollateralSymbol",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "marketLiquidity",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "marketLltv",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "marketApy",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "vaultAllocation",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "vaultSupplied",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getGovernanceTokenPrice",
        inputs: [],
        outputs: [
            {
                name: "_result",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getMarketIncentives",
        inputs: [
            {
                name: "market",
                type: "address",
                internalType: "contract MToken",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.MarketIncentives[]",
                components: [
                    {
                        name: "token",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "supplyIncentivesPerSec",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowIncentivesPerSec",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getMarketInfo",
        inputs: [
            {
                name: "_mToken",
                type: "address",
                internalType: "contract MToken",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.Market",
                components: [
                    {
                        name: "market",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "isListed",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "mintPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "collateralFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "underlyingPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalBorrows",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalReserves",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "cash",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "exchangeRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowIndex",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "reserveFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "incentives",
                        type: "tuple[]",
                        internalType: "struct BaseMoonwellViews.MarketIncentives[]",
                        components: [
                            {
                                name: "token",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "supplyIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "borrowIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getMarketsInfo",
        inputs: [
            {
                name: "_mTokens",
                type: "address[]",
                internalType: "contract MToken[]",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Market[]",
                components: [
                    {
                        name: "market",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "isListed",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyCap",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "mintPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "borrowPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "collateralFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "underlyingPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalBorrows",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalReserves",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "cash",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "exchangeRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowIndex",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "reserveFactor",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyRate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "incentives",
                        type: "tuple[]",
                        internalType: "struct BaseMoonwellViews.MarketIncentives[]",
                        components: [
                            {
                                name: "token",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "supplyIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "borrowIncentivesPerSec",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getNativeTokenPrice",
        inputs: [],
        outputs: [
            {
                name: "_result",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getProtocolInfo",
        inputs: [],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.ProtocolInfo",
                components: [
                    {
                        name: "seizePaused",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "transferPaused",
                        type: "bool",
                        internalType: "bool",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getStakingInfo",
        inputs: [],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.StakingInfo",
                components: [
                    {
                        name: "cooldown",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "unstakeWindow",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "distributionEnd",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "emissionPerSecond",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "lastUpdateTimestamp",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "index",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getTokensBalances",
        inputs: [
            {
                name: "_tokens",
                type: "address[]",
                internalType: "address[]",
            },
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Balances[]",
                components: [
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "token",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserBalances",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Balances[]",
                components: [
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "token",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserBorrowsBalances",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Balances[]",
                components: [
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "token",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserClaimsVotingPower",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.Votes",
                components: [
                    {
                        name: "delegatedVotingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "votingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "delegates",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserMarketsMemberships",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Memberships[]",
                components: [
                    {
                        name: "membership",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "token",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserRewards",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct BaseMoonwellViews.Rewards[]",
                components: [
                    {
                        name: "market",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "rewardToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "supplyRewardsAmount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowRewardsAmount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserStakingInfo",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.UserStakingInfo",
                components: [
                    {
                        name: "cooldown",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "pendingRewards",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalStaked",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserStakingVotingPower",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.Votes",
                components: [
                    {
                        name: "delegatedVotingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "votingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "delegates",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserTokensVotingPower",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.Votes",
                components: [
                    {
                        name: "delegatedVotingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "votingPower",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "delegates",
                        type: "address",
                        internalType: "address",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserVotingPower",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "_result",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.UserVotes",
                components: [
                    {
                        name: "claimsVotes",
                        type: "tuple",
                        internalType: "struct BaseMoonwellViews.Votes",
                        components: [
                            {
                                name: "delegatedVotingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "votingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "delegates",
                                type: "address",
                                internalType: "address",
                            },
                        ],
                    },
                    {
                        name: "stakingVotes",
                        type: "tuple",
                        internalType: "struct BaseMoonwellViews.Votes",
                        components: [
                            {
                                name: "delegatedVotingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "votingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "delegates",
                                type: "address",
                                internalType: "address",
                            },
                        ],
                    },
                    {
                        name: "tokenVotes",
                        type: "tuple",
                        internalType: "struct BaseMoonwellViews.Votes",
                        components: [
                            {
                                name: "delegatedVotingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "votingPower",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "delegates",
                                type: "address",
                                internalType: "address",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getVaultInfo",
        inputs: [
            {
                name: "_vault",
                type: "address",
                internalType: "contract IMetaMorpho",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.MorphoVault",
                components: [
                    {
                        name: "vault",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "totalSupply",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "underlyingPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "fee",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "timelock",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "markets",
                        type: "tuple[]",
                        internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo[]",
                        components: [
                            {
                                name: "marketId",
                                type: "bytes32",
                                internalType: "Id",
                            },
                            {
                                name: "marketCollateral",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "marketCollateralName",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "marketCollateralSymbol",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "marketLiquidity",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "marketLltv",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "marketApy",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "vaultAllocation",
                                type: "uint256",
                                internalType: "uint256",
                            },
                            {
                                name: "vaultSupplied",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getVaultMarketInfo",
        inputs: [
            {
                name: "_marketId",
                type: "bytes32",
                internalType: "Id",
            },
            {
                name: "_morpho",
                type: "address",
                internalType: "contract IMorpho",
            },
            {
                name: "_vault",
                type: "address",
                internalType: "contract IMetaMorpho",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo",
                components: [
                    {
                        name: "marketId",
                        type: "bytes32",
                        internalType: "Id",
                    },
                    {
                        name: "marketCollateral",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "marketCollateralName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "marketCollateralSymbol",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "marketLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "marketLltv",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "marketApy",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "vaultAllocation",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "vaultSupplied",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "governanceToken",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract Well",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "initialize",
        inputs: [
            {
                name: "_comptroller",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenSaleDistributor",
                type: "address",
                internalType: "address",
            },
            {
                name: "_safetyModule",
                type: "address",
                internalType: "address",
            },
            {
                name: "_governanceToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "nativeMarket",
                type: "address",
                internalType: "address",
            },
            {
                name: "governanceTokenLP",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "morphoMarkets",
        inputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "morphoVaults",
        inputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "safetyModule",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract SafetyModuleInterfaceV1",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "setVaults",
        inputs: [
            {
                name: "_vaults",
                type: "address[]",
                internalType: "address[]",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "Initialized",
        inputs: [
            {
                name: "version",
                type: "uint8",
                indexed: false,
                internalType: "uint8",
            },
        ],
        anonymous: false,
    },
];
//# sourceMappingURL=coreViewsAbi.js.map