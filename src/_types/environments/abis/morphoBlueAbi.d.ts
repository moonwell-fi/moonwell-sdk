declare const _default: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "prevBorrowRate";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "interest";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeShares";
        readonly type: "uint256";
    }];
    readonly name: "AccrueInterest";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly name: "Borrow";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
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
        readonly indexed: false;
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
    }];
    readonly name: "CreateMarket";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "irm";
        readonly type: "address";
    }];
    readonly name: "EnableIrm";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "lltv";
        readonly type: "uint256";
    }];
    readonly name: "EnableLltv";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }];
    readonly name: "FlashLoan";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "authorizer";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "usedNonce";
        readonly type: "uint256";
    }];
    readonly name: "IncrementNonce";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "repaidAssets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "repaidShares";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "seizedAssets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "badDebtAssets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "badDebtShares";
        readonly type: "uint256";
    }];
    readonly name: "Liquidate";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly name: "Repay";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "authorizer";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "authorized";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "newIsAuthorized";
        readonly type: "bool";
    }];
    readonly name: "SetAuthorization";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newFee";
        readonly type: "uint256";
    }];
    readonly name: "SetFee";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newFeeRecipient";
        readonly type: "address";
    }];
    readonly name: "SetFeeRecipient";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "SetOwner";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly name: "Supply";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }];
    readonly name: "SupplyCollateral";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly name: "Withdraw";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "assets";
        readonly type: "uint256";
    }];
    readonly name: "WithdrawCollateral";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
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
    }];
    readonly name: "accrueInterest";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "borrow";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
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
    }];
    readonly name: "createMarket";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "irm";
        readonly type: "address";
    }];
    readonly name: "enableIrm";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "lltv";
        readonly type: "uint256";
    }];
    readonly name: "enableLltv";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32[]";
        readonly name: "slots";
        readonly type: "bytes32[]";
    }];
    readonly name: "extSloads";
    readonly outputs: readonly [{
        readonly internalType: "bytes32[]";
        readonly name: "res";
        readonly type: "bytes32[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "feeRecipient";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
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
    readonly name: "flashLoan";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "idToMarketParams";
    readonly outputs: readonly [{
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
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "isAuthorized";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "isIrmEnabled";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "isLltvEnabled";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
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
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "seizedAssets";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "repaidShares";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "liquidate";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "market";
    readonly outputs: readonly [{
        readonly internalType: "uint128";
        readonly name: "totalSupplyAssets";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "totalSupplyShares";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "totalBorrowAssets";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "totalBorrowShares";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "lastUpdate";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "fee";
        readonly type: "uint128";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "nonce";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "position";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "supplyShares";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint128";
        readonly name: "borrowShares";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "collateral";
        readonly type: "uint128";
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
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "repay";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "authorized";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "newIsAuthorized";
        readonly type: "bool";
    }];
    readonly name: "setAuthorization";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    }];
    readonly name: "setAuthorizationWithSig";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly name: "newFee";
        readonly type: "uint256";
    }];
    readonly name: "setFee";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newFeeRecipient";
        readonly type: "address";
    }];
    readonly name: "setFeeRecipient";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "setOwner";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "supply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
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
    readonly name: "supplyCollateral";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly internalType: "address";
        readonly name: "onBehalf";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "withdraw";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
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
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "withdrawCollateral";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export default _default;
//# sourceMappingURL=morphoBlueAbi.d.ts.map