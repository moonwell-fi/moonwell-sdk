declare const _default: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalAccrued";
        readonly type: "uint256";
    }];
    readonly name: "DisbursedBorrowerRewards";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "supplier";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "totalAccrued";
        readonly type: "uint256";
    }];
    readonly name: "DisbursedSupplierRewards";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "FundsRescued";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newIndex";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "newTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "GlobalBorrowIndexUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newSupplyIndex";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "newSupplyGlobalTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "GlobalSupplyIndexUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "version";
        readonly type: "uint8";
    }];
    readonly name: "Initialized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address payable";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "rewardToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "InsufficientTokensToEmit";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldRewardSpeed";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newRewardSpeed";
        readonly type: "uint256";
    }];
    readonly name: "NewBorrowRewardSpeed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "supplySpeed";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "borrowSpeed";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "endTime";
        readonly type: "uint256";
    }];
    readonly name: "NewConfigCreated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldEmissionCap";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newEmissionCap";
        readonly type: "uint256";
    }];
    readonly name: "NewEmissionCap";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "currentOwner";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "NewEmissionConfigOwner";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "oldPauseGuardian";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newPauseGuardian";
        readonly type: "address";
    }];
    readonly name: "NewPauseGuardian";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "currentEndTime";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newEndTime";
        readonly type: "uint256";
    }];
    readonly name: "NewRewardEndTime";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "emissionToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldRewardSpeed";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newRewardSpeed";
        readonly type: "uint256";
    }];
    readonly name: "NewSupplyRewardSpeed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Paused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "RewardsPaused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "RewardsUnpaused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Unpaused";
    readonly type: "event";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_supplyEmissionPerSec";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_borrowEmissionsPerSec";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_endTime";
        readonly type: "uint256";
    }];
    readonly name: "_addEmissionConfig";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "_pauseRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_tokenAddress";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }];
    readonly name: "_rescueFunds";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_newEmissionCap";
        readonly type: "uint256";
    }];
    readonly name: "_setEmissionCap";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_newPauseGuardian";
        readonly type: "address";
    }];
    readonly name: "_setPauseGuardian";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "_unpauseRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_newBorrowSpeed";
        readonly type: "uint256";
    }];
    readonly name: "_updateBorrowSpeed";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_newEndTime";
        readonly type: "uint256";
    }];
    readonly name: "_updateEndTime";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_newOwner";
        readonly type: "address";
    }];
    readonly name: "_updateOwner";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_newSupplySpeed";
        readonly type: "uint256";
    }];
    readonly name: "_updateSupplySpeed";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "comptroller";
    readonly outputs: readonly [{
        readonly internalType: "contract Comptroller";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_borrower";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "_sendTokens";
        readonly type: "bool";
    }];
    readonly name: "disburseBorrowerRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_supplier";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "_sendTokens";
        readonly type: "bool";
    }];
    readonly name: "disburseSupplierRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "emissionCap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }];
    readonly name: "getAllMarketConfigs";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "emissionToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "endTime";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint224";
            readonly name: "supplyGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "supplyGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint224";
            readonly name: "borrowGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "borrowGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "supplyEmissionsPerSec";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "borrowEmissionsPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MultiRewardDistributorCommon.MarketConfig[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }];
    readonly name: "getConfigForMarket";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "emissionToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "endTime";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint224";
            readonly name: "supplyGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "supplyGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint224";
            readonly name: "borrowGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "borrowGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "supplyEmissionsPerSec";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "borrowEmissionsPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MultiRewardDistributorCommon.MarketConfig";
        readonly name: "";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getCurrentEmissionCap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_emissionToken";
        readonly type: "address";
    }];
    readonly name: "getCurrentOwner";
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
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "index";
        readonly type: "uint256";
    }];
    readonly name: "getGlobalBorrowIndex";
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
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "index";
        readonly type: "uint256";
    }];
    readonly name: "getGlobalSupplyIndex";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_user";
        readonly type: "address";
    }];
    readonly name: "getOutstandingRewardsForUser";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "emissionToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "supplySide";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "borrowSide";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MultiRewardDistributorCommon.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_user";
        readonly type: "address";
    }];
    readonly name: "getOutstandingRewardsForUser";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "mToken";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "emissionToken";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "totalAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "supplySide";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "borrowSide";
                readonly type: "uint256";
            }];
            readonly internalType: "struct MultiRewardDistributorCommon.RewardInfo[]";
            readonly name: "rewards";
            readonly type: "tuple[]";
        }];
        readonly internalType: "struct MultiRewardDistributorCommon.RewardWithMToken[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "initialIndexConstant";
    readonly outputs: readonly [{
        readonly internalType: "uint224";
        readonly name: "";
        readonly type: "uint224";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_comptroller";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_pauseGuardian";
        readonly type: "address";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "marketConfigs";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "emissionToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "endTime";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint224";
            readonly name: "supplyGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "supplyGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint224";
            readonly name: "borrowGlobalIndex";
            readonly type: "uint224";
        }, {
            readonly internalType: "uint32";
            readonly name: "borrowGlobalTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "supplyEmissionsPerSec";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "borrowEmissionsPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MultiRewardDistributorCommon.MarketConfig";
        readonly name: "config";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "pauseGuardian";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "paused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }];
    readonly name: "updateMarketBorrowIndex";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_borrower";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "_sendTokens";
        readonly type: "bool";
    }];
    readonly name: "updateMarketBorrowIndexAndDisburseBorrowerRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }];
    readonly name: "updateMarketSupplyIndex";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "_mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_supplier";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "_sendTokens";
        readonly type: "bool";
    }];
    readonly name: "updateMarketSupplyIndexAndDisburseSupplierRewards";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export default _default;
//# sourceMappingURL=multiRewardDistributorAbi.d.ts.map