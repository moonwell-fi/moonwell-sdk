declare const _default: readonly [{
    readonly type: "function";
    readonly name: "comptroller";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract Comptroller";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getAllMarketsInfo";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Market[]";
        readonly components: readonly [{
            readonly name: "market";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isListed";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "mintPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "collateralFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "underlyingPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalBorrows";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalReserves";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "cash";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "exchangeRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowIndex";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "reserveFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "incentives";
            readonly type: "tuple[]";
            readonly internalType: "struct BaseMoonwellViews.MarketIncentives[]";
            readonly components: readonly [{
                readonly name: "token";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "supplyIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "borrowIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getAllVaultsInfo";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.MorphoVault[]";
        readonly components: readonly [{
            readonly name: "vault";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "underlyingPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "fee";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "timelock";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "markets";
            readonly type: "tuple[]";
            readonly internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo[]";
            readonly components: readonly [{
                readonly name: "marketId";
                readonly type: "bytes32";
                readonly internalType: "Id";
            }, {
                readonly name: "marketCollateral";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "marketCollateralName";
                readonly type: "string";
                readonly internalType: "string";
            }, {
                readonly name: "marketCollateralSymbol";
                readonly type: "string";
                readonly internalType: "string";
            }, {
                readonly name: "marketLiquidity";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "marketLltv";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "marketApy";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "vaultAllocation";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "vaultSupplied";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getGovernanceTokenPrice";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMarketIncentives";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "contract MToken";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.MarketIncentives[]";
        readonly components: readonly [{
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "supplyIncentivesPerSec";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowIncentivesPerSec";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMarketInfo";
    readonly inputs: readonly [{
        readonly name: "_mToken";
        readonly type: "address";
        readonly internalType: "contract MToken";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.Market";
        readonly components: readonly [{
            readonly name: "market";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isListed";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "mintPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "collateralFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "underlyingPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalBorrows";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalReserves";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "cash";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "exchangeRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowIndex";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "reserveFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "incentives";
            readonly type: "tuple[]";
            readonly internalType: "struct BaseMoonwellViews.MarketIncentives[]";
            readonly components: readonly [{
                readonly name: "token";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "supplyIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "borrowIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMarketsInfo";
    readonly inputs: readonly [{
        readonly name: "_mTokens";
        readonly type: "address[]";
        readonly internalType: "contract MToken[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Market[]";
        readonly components: readonly [{
            readonly name: "market";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isListed";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyCap";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "mintPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "borrowPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "collateralFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "underlyingPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalBorrows";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalReserves";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "cash";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "exchangeRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowIndex";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "reserveFactor";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyRate";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "incentives";
            readonly type: "tuple[]";
            readonly internalType: "struct BaseMoonwellViews.MarketIncentives[]";
            readonly components: readonly [{
                readonly name: "token";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "supplyIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "borrowIncentivesPerSec";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getNativeTokenPrice";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getProtocolInfo";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.ProtocolInfo";
        readonly components: readonly [{
            readonly name: "seizePaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "transferPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getStakingInfo";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.StakingInfo";
        readonly components: readonly [{
            readonly name: "cooldown";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "unstakeWindow";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "distributionEnd";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "emissionPerSecond";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "lastUpdateTimestamp";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "index";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTokensBalances";
    readonly inputs: readonly [{
        readonly name: "_tokens";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }, {
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Balances[]";
        readonly components: readonly [{
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserBalances";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Balances[]";
        readonly components: readonly [{
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserBorrowsBalances";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Balances[]";
        readonly components: readonly [{
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserClaimsVotingPower";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.Votes";
        readonly components: readonly [{
            readonly name: "delegatedVotingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "votingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "delegates";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserMarketsMemberships";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Memberships[]";
        readonly components: readonly [{
            readonly name: "membership";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserRewards";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct BaseMoonwellViews.Rewards[]";
        readonly components: readonly [{
            readonly name: "market";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "rewardToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "supplyRewardsAmount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowRewardsAmount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserStakingInfo";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.UserStakingInfo";
        readonly components: readonly [{
            readonly name: "cooldown";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "pendingRewards";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalStaked";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserStakingVotingPower";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.Votes";
        readonly components: readonly [{
            readonly name: "delegatedVotingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "votingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "delegates";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserTokensVotingPower";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.Votes";
        readonly components: readonly [{
            readonly name: "delegatedVotingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "votingPower";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "delegates";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserVotingPower";
    readonly inputs: readonly [{
        readonly name: "_user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "_result";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.UserVotes";
        readonly components: readonly [{
            readonly name: "claimsVotes";
            readonly type: "tuple";
            readonly internalType: "struct BaseMoonwellViews.Votes";
            readonly components: readonly [{
                readonly name: "delegatedVotingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "votingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "delegates";
                readonly type: "address";
                readonly internalType: "address";
            }];
        }, {
            readonly name: "stakingVotes";
            readonly type: "tuple";
            readonly internalType: "struct BaseMoonwellViews.Votes";
            readonly components: readonly [{
                readonly name: "delegatedVotingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "votingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "delegates";
                readonly type: "address";
                readonly internalType: "address";
            }];
        }, {
            readonly name: "tokenVotes";
            readonly type: "tuple";
            readonly internalType: "struct BaseMoonwellViews.Votes";
            readonly components: readonly [{
                readonly name: "delegatedVotingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "votingPower";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "delegates";
                readonly type: "address";
                readonly internalType: "address";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getVaultInfo";
    readonly inputs: readonly [{
        readonly name: "_vault";
        readonly type: "address";
        readonly internalType: "contract IMetaMorpho";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.MorphoVault";
        readonly components: readonly [{
            readonly name: "vault";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "totalSupply";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "underlyingPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "fee";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "timelock";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "markets";
            readonly type: "tuple[]";
            readonly internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo[]";
            readonly components: readonly [{
                readonly name: "marketId";
                readonly type: "bytes32";
                readonly internalType: "Id";
            }, {
                readonly name: "marketCollateral";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "marketCollateralName";
                readonly type: "string";
                readonly internalType: "string";
            }, {
                readonly name: "marketCollateralSymbol";
                readonly type: "string";
                readonly internalType: "string";
            }, {
                readonly name: "marketLiquidity";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "marketLltv";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "marketApy";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "vaultAllocation";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "vaultSupplied";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getVaultMarketInfo";
    readonly inputs: readonly [{
        readonly name: "_marketId";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }, {
        readonly name: "_morpho";
        readonly type: "address";
        readonly internalType: "contract IMorpho";
    }, {
        readonly name: "_vault";
        readonly type: "address";
        readonly internalType: "contract IMetaMorpho";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct BaseMoonwellViews.MorphoVaultMarketsInfo";
        readonly components: readonly [{
            readonly name: "marketId";
            readonly type: "bytes32";
            readonly internalType: "Id";
        }, {
            readonly name: "marketCollateral";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "marketCollateralName";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "marketCollateralSymbol";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "marketLiquidity";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "marketLltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "marketApy";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "vaultAllocation";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "vaultSupplied";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "governanceToken";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract Well";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_comptroller";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "tokenSaleDistributor";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_safetyModule";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_governanceToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "nativeMarket";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "governanceTokenLP";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "morphoMarkets";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "morphoVaults";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "safetyModule";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SafetyModuleInterfaceV1";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "setVaults";
    readonly inputs: readonly [{
        readonly name: "_vaults";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }];
    readonly anonymous: false;
}];
export default _default;
//# sourceMappingURL=coreViewsAbi.d.ts.map