declare const _default: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
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
    readonly name: "getMorphoBlueMarketInfo";
    readonly inputs: readonly [{
        readonly name: "_marketId";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct MorphoViews.MorphoBlueMarket";
        readonly components: readonly [{
            readonly name: "marketId";
            readonly type: "bytes32";
            readonly internalType: "Id";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralName";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "collateralSymbol";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "collateralDecimals";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "collateralPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "loanName";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "loanSymbol";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "loanDecimals";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupplyAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalBorrowAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalLiquidity";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyApy";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowApy";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "fee";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oraclePrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMorphoBlueMarketsInfo";
    readonly inputs: readonly [{
        readonly name: "_marketIds";
        readonly type: "bytes32[]";
        readonly internalType: "Id[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct MorphoViews.MorphoBlueMarket[]";
        readonly components: readonly [{
            readonly name: "marketId";
            readonly type: "bytes32";
            readonly internalType: "Id";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralName";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "collateralSymbol";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "collateralDecimals";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "collateralPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "loanName";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "loanSymbol";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "loanDecimals";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalSupplyAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalBorrowAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalLiquidity";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "supplyApy";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "borrowApy";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "fee";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oraclePrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMorphoBlueUserBalance";
    readonly inputs: readonly [{
        readonly name: "_marketId";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }, {
        readonly name: "user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct MorphoViews.UserMarketBalance";
        readonly components: readonly [{
            readonly name: "marketId";
            readonly type: "bytes32";
            readonly internalType: "Id";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "loanAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanShares";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMorphoBlueUserBalances";
    readonly inputs: readonly [{
        readonly name: "_marketIds";
        readonly type: "bytes32[]";
        readonly internalType: "Id[]";
    }, {
        readonly name: "user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct MorphoViews.UserMarketBalance[]";
        readonly components: readonly [{
            readonly name: "marketId";
            readonly type: "bytes32";
            readonly internalType: "Id";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "loanAssets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "loanShares";
            readonly type: "uint256";
            readonly internalType: "uint256";
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
        readonly internalType: "struct MorphoViews.MorphoVault";
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
            readonly internalType: "struct MorphoViews.MorphoVaultMarketsInfo[]";
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
        readonly internalType: "struct MorphoViews.MorphoVaultMarketsInfo";
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
    readonly name: "getVaultsInfo";
    readonly inputs: readonly [{
        readonly name: "morphoVaults";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct MorphoViews.MorphoVault[]";
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
            readonly internalType: "struct MorphoViews.MorphoVaultMarketsInfo[]";
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
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_comptroller";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_morpho";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "morpho";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IMorpho";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "morphoBlueBorrowAPY";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "market";
        readonly type: "tuple";
        readonly internalType: "struct Market";
        readonly components: readonly [{
            readonly name: "totalSupplyAssets";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalSupplyShares";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalBorrowAssets";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalBorrowShares";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "lastUpdate";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "fee";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }];
    }];
    readonly outputs: readonly [{
        readonly name: "borrowApy";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "morphoBlueSupplyAPY";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "market";
        readonly type: "tuple";
        readonly internalType: "struct Market";
        readonly components: readonly [{
            readonly name: "totalSupplyAssets";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalSupplyShares";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalBorrowAssets";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "totalBorrowShares";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "lastUpdate";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "fee";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }];
    }];
    readonly outputs: readonly [{
        readonly name: "supplyApy";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
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
//# sourceMappingURL=morphoViewsAbi.d.ts.map