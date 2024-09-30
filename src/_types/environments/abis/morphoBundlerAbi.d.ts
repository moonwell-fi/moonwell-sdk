declare const _default: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "morpho";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "weth";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "UnsafeCast";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "MORPHO";
    readonly outputs: readonly [{
        readonly internalType: "contract IMorpho";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "WRAPPED_NATIVE";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint160";
                readonly name: "amount";
                readonly type: "uint160";
            }, {
                readonly internalType: "uint48";
                readonly name: "expiration";
                readonly type: "uint48";
            }, {
                readonly internalType: "uint48";
                readonly name: "nonce";
                readonly type: "uint48";
            }];
            readonly internalType: "struct IAllowanceTransfer.PermitDetails";
            readonly name: "details";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "sigDeadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IAllowanceTransfer.PermitSingle";
        readonly name: "permitSingle";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }, {
        readonly internalType: "bool";
        readonly name: "skipRevert";
        readonly type: "bool";
    }];
    readonly name: "approve2";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "asset";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "erc20Transfer";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "asset";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "erc20TransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "wrapper";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "erc20WrapperDepositFor";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "wrapper";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "erc20WrapperWithdrawTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "minShares";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "erc4626Deposit";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "maxAssets";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "erc4626Mint";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "minAssets";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "erc4626Redeem";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "maxShares";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "erc4626Withdraw";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "initiator";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "slippageAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "morphoBorrow";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "morphoFlashLoan";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "slippageAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "morphoRepay";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "authorizer";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "authorized";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isAuthorized";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct Authorization";
        readonly name: "authorization";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint8";
            readonly name: "v";
            readonly type: "uint8";
        }, {
            readonly internalType: "bytes32";
            readonly name: "r";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "s";
            readonly type: "bytes32";
        }];
        readonly internalType: "struct Signature";
        readonly name: "signature";
        readonly type: "tuple";
    }, {
        readonly internalType: "bool";
        readonly name: "skipRevert";
        readonly type: "bool";
    }];
    readonly name: "morphoSetAuthorizationWithSig";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "slippageAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "morphoSupply";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "morphoSupplyCollateral";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "slippageAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "morphoWithdraw";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "morphoWithdrawCollateral";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes[]";
        readonly name: "data";
        readonly type: "bytes[]";
    }];
    readonly name: "multicall";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "nativeTransfer";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "onMorphoFlashLoan";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "onMorphoRepay";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "onMorphoSupply";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "onMorphoSupplyCollateral";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "asset";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bool";
        readonly name: "skipRevert";
        readonly type: "bool";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "publicAllocator";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "loanToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "collateralToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "oracle";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irm";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "lltv";
                readonly type: "uint256";
            }];
            readonly internalType: "struct MarketParams";
            readonly name: "marketParams";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint128";
            readonly name: "amount";
            readonly type: "uint128";
        }];
        readonly internalType: "struct Withdrawal[]";
        readonly name: "withdrawals";
        readonly type: "tuple[]";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "supplyMarketParams";
        readonly type: "tuple";
    }];
    readonly name: "reallocateTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "asset";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom2";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "unwrapNative";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "distributor";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "reward";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes32[]";
        readonly name: "proof";
        readonly type: "bytes32[]";
    }, {
        readonly internalType: "bool";
        readonly name: "skipRevert";
        readonly type: "bool";
    }];
    readonly name: "urdClaim";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "wrapNative";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
export default _default;
//# sourceMappingURL=morphoBundlerAbi.d.ts.map