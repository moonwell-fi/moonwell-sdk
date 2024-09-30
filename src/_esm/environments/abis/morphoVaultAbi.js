export default [
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "morpho",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "initialTimelock",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_asset",
                type: "address",
            },
            {
                internalType: "string",
                name: "_name",
                type: "string",
            },
            {
                internalType: "string",
                name: "_symbol",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "AboveMaxTimelock",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "target",
                type: "address",
            },
        ],
        name: "AddressEmptyCode",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "AddressInsufficientBalance",
        type: "error",
    },
    {
        inputs: [],
        name: "AllCapsReached",
        type: "error",
    },
    {
        inputs: [],
        name: "AlreadyPending",
        type: "error",
    },
    {
        inputs: [],
        name: "AlreadySet",
        type: "error",
    },
    {
        inputs: [],
        name: "BelowMinTimelock",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "DuplicateMarket",
        type: "error",
    },
    {
        inputs: [],
        name: "ECDSAInvalidSignature",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "length",
                type: "uint256",
            },
        ],
        name: "ECDSAInvalidSignatureLength",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
            },
        ],
        name: "ECDSAInvalidSignatureS",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "allowance",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "needed",
                type: "uint256",
            },
        ],
        name: "ERC20InsufficientAllowance",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "balance",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "needed",
                type: "uint256",
            },
        ],
        name: "ERC20InsufficientBalance",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "approver",
                type: "address",
            },
        ],
        name: "ERC20InvalidApprover",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "ERC20InvalidReceiver",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "ERC20InvalidSender",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "ERC20InvalidSpender",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
        ],
        name: "ERC2612ExpiredSignature",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "signer",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "ERC2612InvalidSigner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "max",
                type: "uint256",
            },
        ],
        name: "ERC4626ExceededMaxDeposit",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "max",
                type: "uint256",
            },
        ],
        name: "ERC4626ExceededMaxMint",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "max",
                type: "uint256",
            },
        ],
        name: "ERC4626ExceededMaxRedeem",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "max",
                type: "uint256",
            },
        ],
        name: "ERC4626ExceededMaxWithdraw",
        type: "error",
    },
    {
        inputs: [],
        name: "FailedInnerCall",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "InconsistentAsset",
        type: "error",
    },
    {
        inputs: [],
        name: "InconsistentReallocation",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "currentNonce",
                type: "uint256",
            },
        ],
        name: "InvalidAccountNonce",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "InvalidMarketRemovalNonZeroCap",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "InvalidMarketRemovalNonZeroSupply",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "InvalidMarketRemovalTimelockNotElapsed",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidShortString",
        type: "error",
    },
    {
        inputs: [],
        name: "MarketNotCreated",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "MarketNotEnabled",
        type: "error",
    },
    {
        inputs: [],
        name: "MathOverflowedMulDiv",
        type: "error",
    },
    {
        inputs: [],
        name: "MaxFeeExceeded",
        type: "error",
    },
    {
        inputs: [],
        name: "MaxQueueLengthExceeded",
        type: "error",
    },
    {
        inputs: [],
        name: "NoPendingValue",
        type: "error",
    },
    {
        inputs: [],
        name: "NonZeroCap",
        type: "error",
    },
    {
        inputs: [],
        name: "NotAllocatorRole",
        type: "error",
    },
    {
        inputs: [],
        name: "NotCuratorNorGuardianRole",
        type: "error",
    },
    {
        inputs: [],
        name: "NotCuratorRole",
        type: "error",
    },
    {
        inputs: [],
        name: "NotEnoughLiquidity",
        type: "error",
    },
    {
        inputs: [],
        name: "NotGuardianRole",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "PendingCap",
        type: "error",
    },
    {
        inputs: [],
        name: "PendingRemoval",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "bits",
                type: "uint8",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "SafeCastOverflowedUintDowncast",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "SafeERC20FailedOperation",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "str",
                type: "string",
            },
        ],
        name: "StringTooLong",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "SupplyCapExceeded",
        type: "error",
    },
    {
        inputs: [],
        name: "TimelockNotElapsed",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "UnauthorizedMarket",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroFeeRecipient",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "newTotalAssets",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "feeShares",
                type: "uint256",
            },
        ],
        name: "AccrueInterest",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        name: "Deposit",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "EIP712DomainChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferStarted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "suppliedAssets",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "suppliedShares",
                type: "uint256",
            },
        ],
        name: "ReallocateSupply",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "withdrawnAssets",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "withdrawnShares",
                type: "uint256",
            },
        ],
        name: "ReallocateWithdraw",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "RevokePendingCap",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
        ],
        name: "RevokePendingGuardian",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "RevokePendingMarketRemoval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
        ],
        name: "RevokePendingTimelock",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "cap",
                type: "uint256",
            },
        ],
        name: "SetCap",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newCurator",
                type: "address",
            },
        ],
        name: "SetCurator",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newFee",
                type: "uint256",
            },
        ],
        name: "SetFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newFeeRecipient",
                type: "address",
            },
        ],
        name: "SetFeeRecipient",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "guardian",
                type: "address",
            },
        ],
        name: "SetGuardian",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "allocator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isAllocator",
                type: "bool",
            },
        ],
        name: "SetIsAllocator",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newSkimRecipient",
                type: "address",
            },
        ],
        name: "SetSkimRecipient",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "Id[]",
                name: "newSupplyQueue",
                type: "bytes32[]",
            },
        ],
        name: "SetSupplyQueue",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newTimelock",
                type: "uint256",
            },
        ],
        name: "SetTimelock",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "Id[]",
                name: "newWithdrawQueue",
                type: "bytes32[]",
            },
        ],
        name: "SetWithdrawQueue",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "Skim",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "cap",
                type: "uint256",
            },
        ],
        name: "SubmitCap",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newGuardian",
                type: "address",
            },
        ],
        name: "SubmitGuardian",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "SubmitMarketRemoval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "newTimelock",
                type: "uint256",
            },
        ],
        name: "SubmitTimelock",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "updatedTotalAssets",
                type: "uint256",
            },
        ],
        name: "UpdateLastTotalAssets",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        name: "Withdraw",
        type: "event",
    },
    {
        inputs: [],
        name: "DECIMALS_OFFSET",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MORPHO",
        outputs: [
            {
                internalType: "contract IMorpho",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "loanToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "collateralToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "oracle",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "irm",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "lltv",
                        type: "uint256",
                    },
                ],
                internalType: "struct MarketParams",
                name: "marketParams",
                type: "tuple",
            },
        ],
        name: "acceptCap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptGuardian",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptTimelock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "asset",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "",
                type: "bytes32",
            },
        ],
        name: "config",
        outputs: [
            {
                internalType: "uint184",
                name: "cap",
                type: "uint184",
            },
            {
                internalType: "bool",
                name: "enabled",
                type: "bool",
            },
            {
                internalType: "uint64",
                name: "removableAt",
                type: "uint64",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        name: "convertToAssets",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        name: "convertToShares",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "curator",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "deposit",
        outputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "eip712Domain",
        outputs: [
            {
                internalType: "bytes1",
                name: "fields",
                type: "bytes1",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "version",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "verifyingContract",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "salt",
                type: "bytes32",
            },
            {
                internalType: "uint256[]",
                name: "extensions",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "fee",
        outputs: [
            {
                internalType: "uint96",
                name: "",
                type: "uint96",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "feeRecipient",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "guardian",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "isAllocator",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "lastTotalAssets",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "maxDeposit",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "maxMint",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "maxRedeem",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "maxWithdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "mint",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes[]",
                name: "data",
                type: "bytes[]",
            },
        ],
        name: "multicall",
        outputs: [
            {
                internalType: "bytes[]",
                name: "results",
                type: "bytes[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "nonces",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "",
                type: "bytes32",
            },
        ],
        name: "pendingCap",
        outputs: [
            {
                internalType: "uint192",
                name: "value",
                type: "uint192",
            },
            {
                internalType: "uint64",
                name: "validAt",
                type: "uint64",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingGuardian",
        outputs: [
            {
                internalType: "address",
                name: "value",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "validAt",
                type: "uint64",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingOwner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingTimelock",
        outputs: [
            {
                internalType: "uint192",
                name: "value",
                type: "uint192",
            },
            {
                internalType: "uint64",
                name: "validAt",
                type: "uint64",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
            {
                internalType: "uint8",
                name: "v",
                type: "uint8",
            },
            {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
            },
        ],
        name: "permit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        name: "previewDeposit",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        name: "previewMint",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        name: "previewRedeem",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        name: "previewWithdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "address",
                                name: "loanToken",
                                type: "address",
                            },
                            {
                                internalType: "address",
                                name: "collateralToken",
                                type: "address",
                            },
                            {
                                internalType: "address",
                                name: "oracle",
                                type: "address",
                            },
                            {
                                internalType: "address",
                                name: "irm",
                                type: "address",
                            },
                            {
                                internalType: "uint256",
                                name: "lltv",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct MarketParams",
                        name: "marketParams",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "assets",
                        type: "uint256",
                    },
                ],
                internalType: "struct MarketAllocation[]",
                name: "allocations",
                type: "tuple[]",
            },
        ],
        name: "reallocate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "redeem",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "revokePendingCap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "revokePendingGuardian",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Id",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "revokePendingMarketRemoval",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "revokePendingTimelock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newCurator",
                type: "address",
            },
        ],
        name: "setCurator",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "newFee",
                type: "uint256",
            },
        ],
        name: "setFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newFeeRecipient",
                type: "address",
            },
        ],
        name: "setFeeRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newAllocator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "newIsAllocator",
                type: "bool",
            },
        ],
        name: "setIsAllocator",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newSkimRecipient",
                type: "address",
            },
        ],
        name: "setSkimRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Id[]",
                name: "newSupplyQueue",
                type: "bytes32[]",
            },
        ],
        name: "setSupplyQueue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "skim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "skimRecipient",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "loanToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "collateralToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "oracle",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "irm",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "lltv",
                        type: "uint256",
                    },
                ],
                internalType: "struct MarketParams",
                name: "marketParams",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "newSupplyCap",
                type: "uint256",
            },
        ],
        name: "submitCap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newGuardian",
                type: "address",
            },
        ],
        name: "submitGuardian",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "loanToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "collateralToken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "oracle",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "irm",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "lltv",
                        type: "uint256",
                    },
                ],
                internalType: "struct MarketParams",
                name: "marketParams",
                type: "tuple",
            },
        ],
        name: "submitMarketRemoval",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "newTimelock",
                type: "uint256",
            },
        ],
        name: "submitTimelock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "supplyQueue",
        outputs: [
            {
                internalType: "Id",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "supplyQueueLength",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "timelock",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalAssets",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256[]",
                name: "indexes",
                type: "uint256[]",
            },
        ],
        name: "updateWithdrawQueue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "withdrawQueue",
        outputs: [
            {
                internalType: "Id",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "withdrawQueueLength",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
//# sourceMappingURL=morphoVaultAbi.js.map