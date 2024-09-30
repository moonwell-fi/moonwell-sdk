declare const _default: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "morpho";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "AlreadySet";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "DepositMarketInWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "EmptyWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InconsistentWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "IncorrectFee";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MarketNotEnabled";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MaxInflowExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MaxOutflowExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "MaxSettableFlowCapExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotAdminNorVaultOwner";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "NotEnoughSupply";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "WithdrawZero";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "supplyMarketId";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "suppliedAssets";
        readonly type: "uint256";
    }];
    readonly name: "PublicReallocateTo";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "withdrawnAssets";
        readonly type: "uint256";
    }];
    readonly name: "PublicWithdrawal";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "admin";
        readonly type: "address";
    }];
    readonly name: "SetAdmin";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "fee";
        readonly type: "uint256";
    }];
    readonly name: "SetFee";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "Id";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint128";
                readonly name: "maxIn";
                readonly type: "uint128";
            }, {
                readonly internalType: "uint128";
                readonly name: "maxOut";
                readonly type: "uint128";
            }];
            readonly internalType: "struct FlowCaps";
            readonly name: "caps";
            readonly type: "tuple";
        }];
        readonly indexed: false;
        readonly internalType: "struct FlowCapsConfig[]";
        readonly name: "config";
        readonly type: "tuple[]";
    }];
    readonly name: "SetFlowCaps";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "feeRecipient";
        readonly type: "address";
    }];
    readonly name: "TransferFee";
    readonly type: "event";
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
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "accruedFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "admin";
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
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "fee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
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
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "flowCaps";
    readonly outputs: readonly [{
        readonly internalType: "uint128";
        readonly name: "maxIn";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "maxOut";
        readonly type: "uint128";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
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
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "newAdmin";
        readonly type: "address";
    }];
    readonly name: "setAdmin";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
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
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "Id";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint128";
                readonly name: "maxIn";
                readonly type: "uint128";
            }, {
                readonly internalType: "uint128";
                readonly name: "maxOut";
                readonly type: "uint128";
            }];
            readonly internalType: "struct FlowCaps";
            readonly name: "caps";
            readonly type: "tuple";
        }];
        readonly internalType: "struct FlowCapsConfig[]";
        readonly name: "config";
        readonly type: "tuple[]";
    }];
    readonly name: "setFlowCaps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "address payable";
        readonly name: "feeRecipient";
        readonly type: "address";
    }];
    readonly name: "transferFee";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export default _default;
//# sourceMappingURL=morphoPublicAllocatorAbi.d.ts.map