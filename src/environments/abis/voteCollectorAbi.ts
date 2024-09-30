export default [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bridgeCost",
    inputs: [
      {
        name: "dstWormholeChainId",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [
      {
        name: "gasCost",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bridgeCostAll",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "castVote",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "voteValue",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emitVotes",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "fromWormholeFormat",
    inputs: [
      {
        name: "whFormatAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "gasLimit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllTargetChains",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16[]",
        internalType: "uint16[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllTargetChainsLength",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReceipt",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "voter",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "hasVoted",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "voteValue",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "votes",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVotes",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "timestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_xWell",
        type: "address",
        internalType: "address",
      },
      {
        name: "_stkWell",
        type: "address",
        internalType: "address",
      },
      {
        name: "_moonbeamGovernor",
        type: "address",
        internalType: "address",
      },
      {
        name: "_wormholeRelayer",
        type: "address",
        internalType: "address",
      },
      {
        name: "_moonbeamWormholeChainId",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isTrustedSender",
    inputs: [
      {
        name: "chainId",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTrustedSender",
    inputs: [
      {
        name: "chainId",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "addr",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "processedNonces",
    inputs: [
      {
        name: "nonce",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "processed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposalInformation",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "voteSnapshotTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "votingStartTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "votingEndTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "crossChainVoteCollectionEndTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "totalVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "forVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "againstVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "abstainVotes",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposalVotes",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "totalVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "forVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "againstVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "abstainVotes",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposals",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "votingStartTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "voteSnapshotTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "votingEndTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "crossChainVoteCollectionEndTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "votes",
        type: "tuple",
        internalType: "struct IMultichainVoteCollection.MultichainVotes",
        components: [
          {
            name: "forVotes",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "againstVotes",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "abstainVotes",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalVotes",
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
    name: "receiveWormholeMessages",
    inputs: [
      {
        name: "payload",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "",
        type: "bytes[]",
        internalType: "bytes[]",
      },
      {
        name: "senderAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "sourceChain",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "nonce",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setGasLimit",
    inputs: [
      {
        name: "newGasLimit",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setNewStakedWell",
    inputs: [
      {
        name: "newStakedWell",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stkWell",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SnapshotInterface",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetAddress",
    inputs: [
      {
        name: "chainId",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "wormholeRelayer",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IWormholeRelayer",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "xWell",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract xWELL",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BridgeOutFailed",
    inputs: [
      {
        name: "dstChainId",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "payload",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "refundAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BridgeOutSuccess",
    inputs: [
      {
        name: "dstWormholeChainId",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "cost",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "dst",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "payload",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GasLimitUpdated",
    inputs: [
      {
        name: "oldGasLimit",
        type: "uint96",
        indexed: false,
        internalType: "uint96",
      },
      {
        name: "newGasLimit",
        type: "uint96",
        indexed: false,
        internalType: "uint96",
      },
    ],
    anonymous: false,
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
  {
    type: "event",
    name: "NewStakedWellSet",
    inputs: [
      {
        name: "newStakedWell",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalCreated",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "votingStartTime",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "votingEndTime",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "votingCollectionEndTime",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TargetAddressUpdated",
    inputs: [
      {
        name: "dstChainId",
        type: "uint16",
        indexed: true,
        internalType: "uint16",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VoteCast",
    inputs: [
      {
        name: "voter",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "voteValue",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
      {
        name: "votes",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VotesEmitted",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "forVotes",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "againstVotes",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "abstainVotes",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
