declare const _default: readonly [{
    readonly inputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "action";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "pauseState";
        readonly type: "bool";
    }];
    readonly name: "ActionPaused";
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
        readonly internalType: "string";
        readonly name: "action";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "pauseState";
        readonly type: "bool";
    }];
    readonly name: "ActionPaused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "rewardToken";
        readonly type: "uint8";
    }, {
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newBorrowRewardSpeed";
        readonly type: "uint256";
    }];
    readonly name: "BorrowRewardSpeedUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "contributor";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newSpeed";
        readonly type: "uint256";
    }];
    readonly name: "ContributorWellSpeedUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint8";
        readonly name: "tokenType";
        readonly type: "uint8";
    }, {
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
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "wellDelta";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "wellBorrowIndex";
        readonly type: "uint256";
    }];
    readonly name: "DistributedBorrowerReward";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint8";
        readonly name: "tokenType";
        readonly type: "uint8";
    }, {
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
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "wellDelta";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "wellBorrowIndex";
        readonly type: "uint256";
    }];
    readonly name: "DistributedSupplierReward";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "error";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "info";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "detail";
        readonly type: "uint256";
    }];
    readonly name: "Failure";
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
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "MarketEntered";
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
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "MarketExited";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }];
    readonly name: "MarketListed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newBorrowCap";
        readonly type: "uint256";
    }];
    readonly name: "NewBorrowCap";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "oldBorrowCapGuardian";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newBorrowCapGuardian";
        readonly type: "address";
    }];
    readonly name: "NewBorrowCapGuardian";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldCloseFactorMantissa";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newCloseFactorMantissa";
        readonly type: "uint256";
    }];
    readonly name: "NewCloseFactor";
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
        readonly internalType: "uint256";
        readonly name: "oldCollateralFactorMantissa";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newCollateralFactorMantissa";
        readonly type: "uint256";
    }];
    readonly name: "NewCollateralFactor";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldLiquidationIncentiveMantissa";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newLiquidationIncentiveMantissa";
        readonly type: "uint256";
    }];
    readonly name: "NewLiquidationIncentive";
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
        readonly indexed: false;
        readonly internalType: "contract PriceOracle";
        readonly name: "oldPriceOracle";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "contract PriceOracle";
        readonly name: "newPriceOracle";
        readonly type: "address";
    }];
    readonly name: "NewPriceOracle";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "rewardToken";
        readonly type: "uint8";
    }, {
        readonly indexed: true;
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newSupplyRewardSpeed";
        readonly type: "uint256";
    }];
    readonly name: "SupplyRewardSpeedUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "WellGranted";
    readonly type: "event";
}, {
    readonly payable: true;
    readonly stateMutability: "payable";
    readonly type: "fallback";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract Unitroller";
        readonly name: "unitroller";
        readonly type: "address";
    }];
    readonly name: "_become";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "_borrowGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address payable";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "_grantWell";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "_mintGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newBorrowCapGuardian";
        readonly type: "address";
    }];
    readonly name: "_setBorrowCapGuardian";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "state";
        readonly type: "bool";
    }];
    readonly name: "_setBorrowPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newCloseFactorMantissa";
        readonly type: "uint256";
    }];
    readonly name: "_setCloseFactor";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "newCollateralFactorMantissa";
        readonly type: "uint256";
    }];
    readonly name: "_setCollateralFactor";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newLiquidationIncentiveMantissa";
        readonly type: "uint256";
    }];
    readonly name: "_setLiquidationIncentive";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract MToken[]";
        readonly name: "mTokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "newBorrowCaps";
        readonly type: "uint256[]";
    }];
    readonly name: "_setMarketBorrowCaps";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "state";
        readonly type: "bool";
    }];
    readonly name: "_setMintPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newPauseGuardian";
        readonly type: "address";
    }];
    readonly name: "_setPauseGuardian";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract PriceOracle";
        readonly name: "newOracle";
        readonly type: "address";
    }];
    readonly name: "_setPriceOracle";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "rewardType";
        readonly type: "uint8";
    }, {
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "supplyRewardSpeed";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "borrowRewardSpeed";
        readonly type: "uint256";
    }];
    readonly name: "_setRewardSpeed";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "bool";
        readonly name: "state";
        readonly type: "bool";
    }];
    readonly name: "_setSeizePaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "bool";
        readonly name: "state";
        readonly type: "bool";
    }];
    readonly name: "_setTransferPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }];
    readonly name: "_supportMarket";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "accountAssets";
    readonly outputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "admin";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "allMarkets";
    readonly outputs: readonly [{
        readonly internalType: "contract MToken";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "borrowAmount";
        readonly type: "uint256";
    }];
    readonly name: "borrowAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "borrowCapGuardian";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "borrowCaps";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "borrowGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "borrowRewardSpeeds";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "borrowAmount";
        readonly type: "uint256";
    }];
    readonly name: "borrowVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "contract MToken";
        readonly name: "mToken";
        readonly type: "address";
    }];
    readonly name: "checkMembership";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "rewardType";
        readonly type: "uint8";
    }, {
        readonly internalType: "address payable";
        readonly name: "holder";
        readonly type: "address";
    }];
    readonly name: "claimReward";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "rewardType";
        readonly type: "uint8";
    }, {
        readonly internalType: "address payable";
        readonly name: "holder";
        readonly type: "address";
    }, {
        readonly internalType: "contract MToken[]";
        readonly name: "mTokens";
        readonly type: "address[]";
    }];
    readonly name: "claimReward";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "rewardType";
        readonly type: "uint8";
    }, {
        readonly internalType: "address payable[]";
        readonly name: "holders";
        readonly type: "address[]";
    }, {
        readonly internalType: "contract MToken[]";
        readonly name: "mTokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "bool";
        readonly name: "borrowers";
        readonly type: "bool";
    }, {
        readonly internalType: "bool";
        readonly name: "suppliers";
        readonly type: "bool";
    }];
    readonly name: "claimReward";
    readonly outputs: readonly [];
    readonly payable: true;
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "closeFactorMantissa";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "comptrollerImplementation";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "mTokens";
        readonly type: "address[]";
    }];
    readonly name: "enterMarkets";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenAddress";
        readonly type: "address";
    }];
    readonly name: "exitMarket";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getAccountLiquidity";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "getAllMarkets";
    readonly outputs: readonly [{
        readonly internalType: "contract MToken[]";
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getAssetsIn";
    readonly outputs: readonly [{
        readonly internalType: "contract MToken[]";
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "getBlockTimestamp";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenModify";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "redeemTokens";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "borrowAmount";
        readonly type: "uint256";
    }];
    readonly name: "getHypotheticalAccountLiquidity";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "initialIndexConstant";
    readonly outputs: readonly [{
        readonly internalType: "uint224";
        readonly name: "";
        readonly type: "uint224";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "isComptroller";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenBorrowed";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenCollateral";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "liquidator";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "repayAmount";
        readonly type: "uint256";
    }];
    readonly name: "liquidateBorrowAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenBorrowed";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenCollateral";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "liquidator";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "actualRepayAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "seizeTokens";
        readonly type: "uint256";
    }];
    readonly name: "liquidateBorrowVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenBorrowed";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenCollateral";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "actualRepayAmount";
        readonly type: "uint256";
    }];
    readonly name: "liquidateCalculateSeizeTokens";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "liquidationIncentiveMantissa";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "markets";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "isListed";
        readonly type: "bool";
    }, {
        readonly internalType: "uint256";
        readonly name: "collateralFactorMantissa";
        readonly type: "uint256";
    }, {
        readonly internalType: "bool";
        readonly name: "isWelled";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "maxAssets";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "minter";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "mintAmount";
        readonly type: "uint256";
    }];
    readonly name: "mintAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "mintGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "minter";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "actualMintAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "mintTokens";
        readonly type: "uint256";
    }];
    readonly name: "mintVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "oracle";
    readonly outputs: readonly [{
        readonly internalType: "contract PriceOracle";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "pauseGuardian";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "pendingAdmin";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "pendingComptrollerImplementation";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "redeemer";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "redeemTokens";
        readonly type: "uint256";
    }];
    readonly name: "redeemAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "redeemer";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "redeemAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "redeemTokens";
        readonly type: "uint256";
    }];
    readonly name: "redeemVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "payer";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "repayAmount";
        readonly type: "uint256";
    }];
    readonly name: "repayBorrowAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "payer";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "actualRepayAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "borrowerIndex";
        readonly type: "uint256";
    }];
    readonly name: "repayBorrowVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewardAccrued";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewardBorrowState";
    readonly outputs: readonly [{
        readonly internalType: "uint224";
        readonly name: "index";
        readonly type: "uint224";
    }, {
        readonly internalType: "uint32";
        readonly name: "timestamp";
        readonly type: "uint32";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewardBorrowerIndex";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardGlmr";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewardSupplierIndex";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewardSupplyState";
    readonly outputs: readonly [{
        readonly internalType: "uint224";
        readonly name: "index";
        readonly type: "uint224";
    }, {
        readonly internalType: "uint32";
        readonly name: "timestamp";
        readonly type: "uint32";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardWell";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenCollateral";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenBorrowed";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "liquidator";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "seizeTokens";
        readonly type: "uint256";
    }];
    readonly name: "seizeAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "seizeGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mTokenCollateral";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "mTokenBorrowed";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "liquidator";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "borrower";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "seizeTokens";
        readonly type: "uint256";
    }];
    readonly name: "seizeVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newWellAddress";
        readonly type: "address";
    }];
    readonly name: "setWellAddress";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "supplyRewardSpeeds";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "src";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "dst";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "transferTokens";
        readonly type: "uint256";
    }];
    readonly name: "transferAllowed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "transferGuardianPaused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "mToken";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "src";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "dst";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "transferTokens";
        readonly type: "uint256";
    }];
    readonly name: "transferVerify";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "wellAddress";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}];
export default _default;
//# sourceMappingURL=comptrollerAbi.d.ts.map