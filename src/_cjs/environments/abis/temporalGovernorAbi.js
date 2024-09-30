"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        inputs: [
            {
                internalType: "address",
                name: "wormholeCore",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_proposalDelay",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_permissionlessUnpauseTime",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "uint16",
                        name: "chainId",
                        type: "uint16",
                    },
                    {
                        internalType: "address",
                        name: "addr",
                        type: "address",
                    },
                ],
                internalType: "struct ITemporalGovernor.TrustedSender[]",
                name: "_trustedSenders",
                type: "tuple[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "ExecutedTransaction",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        name: "GuardianPauseGranted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "guardian",
                type: "address",
            },
        ],
        name: "GuardianRevoked",
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
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "Paused",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        name: "PermissionlessUnpaused",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "intendedRecipient",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address[]",
                name: "targets",
                type: "address[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "values",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "bytes[]",
                name: "calldatas",
                type: "bytes[]",
            },
        ],
        name: "QueuedTransaction",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint16",
                name: "chainId",
                type: "uint16",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addr",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "added",
                type: "bool",
            },
        ],
        name: "TrustedSenderUpdated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "Unpaused",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "addressToBytes",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "chainId",
                type: "uint16",
            },
        ],
        name: "allTrustedSenders",
        outputs: [
            {
                internalType: "bytes32[]",
                name: "",
                type: "bytes32[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "VAA",
                type: "bytes",
            },
        ],
        name: "executeProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "VAA",
                type: "bytes",
            },
        ],
        name: "fastTrackProposalExecution",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "grantGuardiansPause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "guardianPauseAllowed",
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
        inputs: [
            {
                internalType: "uint16",
                name: "chainId",
                type: "uint16",
            },
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "isTrustedSender",
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
        inputs: [
            {
                internalType: "uint16",
                name: "chainId",
                type: "uint16",
            },
            {
                internalType: "bytes32",
                name: "addr",
                type: "bytes32",
            },
        ],
        name: "isTrustedSender",
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
        name: "lastPauseTime",
        outputs: [
            {
                internalType: "uint248",
                name: "",
                type: "uint248",
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
        inputs: [],
        name: "paused",
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
        name: "permissionlessUnpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "permissionlessUnpauseTime",
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
        name: "proposalDelay",
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
                internalType: "bytes",
                name: "VAA",
                type: "bytes",
            },
        ],
        name: "queueProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "queuedTransactions",
        outputs: [
            {
                internalType: "bool",
                name: "executed",
                type: "bool",
            },
            {
                internalType: "uint248",
                name: "queueTime",
                type: "uint248",
            },
        ],
        stateMutability: "view",
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
        inputs: [],
        name: "revokeGuardian",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint16",
                        name: "chainId",
                        type: "uint16",
                    },
                    {
                        internalType: "address",
                        name: "addr",
                        type: "address",
                    },
                ],
                internalType: "struct ITemporalGovernor.TrustedSender[]",
                name: "_trustedSenders",
                type: "tuple[]",
            },
        ],
        name: "setTrustedSenders",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "togglePause",
        outputs: [],
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
                components: [
                    {
                        internalType: "uint16",
                        name: "chainId",
                        type: "uint16",
                    },
                    {
                        internalType: "address",
                        name: "addr",
                        type: "address",
                    },
                ],
                internalType: "struct ITemporalGovernor.TrustedSender[]",
                name: "_trustedSenders",
                type: "tuple[]",
            },
        ],
        name: "unSetTrustedSenders",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "wormholeBridge",
        outputs: [
            {
                internalType: "contract IWormhole",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
//# sourceMappingURL=temporalGovernorAbi.js.map