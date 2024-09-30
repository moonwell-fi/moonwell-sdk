export default [
    {
        type: "constructor",
        inputs: [],
        stateMutability: "nonpayable",
    },
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
        name: "getMorphoBlueMarketInfo",
        inputs: [
            {
                name: "_marketId",
                type: "bytes32",
                internalType: "Id",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct MorphoViews.MorphoBlueMarket",
                components: [
                    {
                        name: "marketId",
                        type: "bytes32",
                        internalType: "Id",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "collateralSymbol",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "collateralDecimals",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "collateralPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "loanName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "loanSymbol",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "loanDecimals",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupplyAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalBorrowAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "lltv",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyApy",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowApy",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "fee",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "oracle",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "oraclePrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "irm",
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
        name: "getMorphoBlueMarketsInfo",
        inputs: [
            {
                name: "_marketIds",
                type: "bytes32[]",
                internalType: "Id[]",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct MorphoViews.MorphoBlueMarket[]",
                components: [
                    {
                        name: "marketId",
                        type: "bytes32",
                        internalType: "Id",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "collateralSymbol",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "collateralDecimals",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "collateralPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "loanName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "loanSymbol",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "loanDecimals",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanPrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalSupplyAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalBorrowAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "totalLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "lltv",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "supplyApy",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "borrowApy",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "fee",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "oracle",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "oraclePrice",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "irm",
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
        name: "getMorphoBlueUserBalance",
        inputs: [
            {
                name: "_marketId",
                type: "bytes32",
                internalType: "Id",
            },
            {
                name: "user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct MorphoViews.UserMarketBalance",
                components: [
                    {
                        name: "marketId",
                        type: "bytes32",
                        internalType: "Id",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "loanAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanShares",
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
        name: "getMorphoBlueUserBalances",
        inputs: [
            {
                name: "_marketIds",
                type: "bytes32[]",
                internalType: "Id[]",
            },
            {
                name: "user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct MorphoViews.UserMarketBalance[]",
                components: [
                    {
                        name: "marketId",
                        type: "bytes32",
                        internalType: "Id",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "loanAssets",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "loanShares",
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
                internalType: "struct MorphoViews.MorphoVault",
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
                        internalType: "struct MorphoViews.MorphoVaultMarketsInfo[]",
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
                internalType: "struct MorphoViews.MorphoVaultMarketsInfo",
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
        name: "getVaultsInfo",
        inputs: [
            {
                name: "morphoVaults",
                type: "address[]",
                internalType: "address[]",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct MorphoViews.MorphoVault[]",
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
                        internalType: "struct MorphoViews.MorphoVaultMarketsInfo[]",
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
        name: "initialize",
        inputs: [
            {
                name: "_comptroller",
                type: "address",
                internalType: "address",
            },
            {
                name: "_morpho",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "morpho",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract IMorpho",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "morphoBlueBorrowAPY",
        inputs: [
            {
                name: "marketParams",
                type: "tuple",
                internalType: "struct MarketParams",
                components: [
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "oracle",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "irm",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "lltv",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
            {
                name: "market",
                type: "tuple",
                internalType: "struct Market",
                components: [
                    {
                        name: "totalSupplyAssets",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalSupplyShares",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalBorrowAssets",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalBorrowShares",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "lastUpdate",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "fee",
                        type: "uint128",
                        internalType: "uint128",
                    },
                ],
            },
        ],
        outputs: [
            {
                name: "borrowApy",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "morphoBlueSupplyAPY",
        inputs: [
            {
                name: "marketParams",
                type: "tuple",
                internalType: "struct MarketParams",
                components: [
                    {
                        name: "loanToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "collateralToken",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "oracle",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "irm",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "lltv",
                        type: "uint256",
                        internalType: "uint256",
                    },
                ],
            },
            {
                name: "market",
                type: "tuple",
                internalType: "struct Market",
                components: [
                    {
                        name: "totalSupplyAssets",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalSupplyShares",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalBorrowAssets",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "totalBorrowShares",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "lastUpdate",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "fee",
                        type: "uint128",
                        internalType: "uint128",
                    },
                ],
            },
        ],
        outputs: [
            {
                name: "supplyApy",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
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
//# sourceMappingURL=morphoViewsAbi.js.map