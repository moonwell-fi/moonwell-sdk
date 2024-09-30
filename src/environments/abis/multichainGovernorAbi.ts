export default [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addExternalChainConfigs",
    inputs: [
      {
        name: "_trustedSenders",
        type: "tuple[]",
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        components: [
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
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "breakGlassGuardian",
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
    name: "cancel",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "chainAddressVotes",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "wormholeChainId",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [
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
    name: "chainVoteCollectorVotes",
    inputs: [
      {
        name: "wormholeChainId",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
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
    name: "crossChainVoteCollectionPeriod",
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
    name: "currentUserLiveProposals",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
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
    name: "distributor",
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
    name: "execute",
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
    name: "executeBreakGlass",
    inputs: [
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "getCurrentVotes",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
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
    name: "getNumLiveProposals",
    inputs: [],
    outputs: [
      {
        name: "count",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getProposalData",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "values",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        internalType: "bytes[]",
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
    name: "getUserLiveProposals",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
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
      {
        name: "blockNumber",
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
        name: "initData",
        type: "tuple",
        internalType: "struct MultichainGovernor.InitializeData",
        components: [
          {
            name: "well",
            type: "address",
            internalType: "address",
          },
          {
            name: "xWell",
            type: "address",
            internalType: "address",
          },
          {
            name: "stkWell",
            type: "address",
            internalType: "address",
          },
          {
            name: "distributor",
            type: "address",
            internalType: "address",
          },
          {
            name: "proposalThreshold",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "votingPeriodSeconds",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "crossChainVoteCollectionPeriod",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quorum",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxUserLiveProposals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pauseDuration",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "pauseGuardian",
            type: "address",
            internalType: "address",
          },
          {
            name: "breakGlassGuardian",
            type: "address",
            internalType: "address",
          },
          {
            name: "wormholeRelayer",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "trustedSenders",
        type: "tuple[]",
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        components: [
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
      },
      {
        name: "calldatas",
        type: "bytes[]",
        internalType: "bytes[]",
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
    name: "kickGuardian",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "liveProposals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxUserLiveProposals",
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
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pauseDuration",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pauseGuardian",
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
    name: "pauseStartTime",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pauseUsed",
    inputs: [],
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
    name: "paused",
    inputs: [],
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
    name: "proposalActive",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
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
    name: "proposalCount",
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
        name: "proposer",
        type: "address",
        internalType: "address",
      },
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
        name: "endTimestamp",
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
    name: "proposalThreshold",
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
        name: "proposer",
        type: "address",
        internalType: "address",
      },
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
        name: "voteSnapshotBlock",
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
      {
        name: "totalVotes",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "canceled",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "executed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "propose",
    inputs: [
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "values",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
      {
        name: "description",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "quorum",
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
    name: "rebroadcastProposal",
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
    name: "removeExternalChainConfigs",
    inputs: [
      {
        name: "_trustedSenders",
        type: "tuple[]",
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        components: [
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
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBreakGlassGuardian",
    inputs: [
      {
        name: "newGuardian",
        type: "address",
        internalType: "address",
      },
    ],
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
      {
        name: "toUseTimestamps",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "state",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum IMultichainGovernor.ProposalState",
      },
    ],
    stateMutability: "view",
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
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateApprovedCalldata",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateCrossChainVoteCollectionPeriod",
    inputs: [
      {
        name: "newCrossChainVoteCollectionPeriod",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateMaxUserLiveProposals",
    inputs: [
      {
        name: "newMaxLiveProposals",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateProposalThreshold",
    inputs: [
      {
        name: "newProposalThreshold",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateQuorum",
    inputs: [
      {
        name: "newQuorum",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateVotingPeriod",
    inputs: [
      {
        name: "newVotingPeriod",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "useTimestamps",
    inputs: [],
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
    name: "votingPeriod",
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
    name: "well",
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
    name: "whitelistedCalldatas",
    inputs: [
      {
        name: "whitelistedCalldata",
        type: "bytes",
        internalType: "bytes",
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
    name: "BreakGlassExecuted",
    inputs: [
      {
        name: "breakGlassGuardian",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "targets",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        indexed: false,
        internalType: "bytes[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BreakGlassGuardianChanged",
    inputs: [
      {
        name: "oldValue",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newValue",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
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
    name: "CalldataApprovalUpdated",
    inputs: [
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CrossChainVoteCollected",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "sourceChain",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
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
  {
    type: "event",
    name: "CrossChainVoteCollectionPeriodChanged",
    inputs: [
      {
        name: "oldValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
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
    name: "GovernanceReturnAddressChanged",
    inputs: [
      {
        name: "oldValue",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newValue",
        type: "address",
        indexed: false,
        internalType: "address",
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
      {
        name: "toUseTimestamps",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PauseDurationUpdated",
    inputs: [
      {
        name: "oldPauseDuration",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newPauseDuration",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PauseGuardianUpdated",
    inputs: [
      {
        name: "oldPauseGuardian",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newPauseGuardian",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PauseTimeUpdated",
    inputs: [
      {
        name: "newPauseStartTime",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalCanceled",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalCreated",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "proposer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "targets",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "values",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "calldatas",
        type: "bytes[]",
        indexed: false,
        internalType: "bytes[]",
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
        name: "description",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalExecuted",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalQueued",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "eta",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalRebroadcasted",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalThresholdChanged",
    inputs: [
      {
        name: "oldValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "QuroumVotesChanged",
    inputs: [
      {
        name: "oldValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StartBlockSet",
    inputs: [
      {
        name: "proposalId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "startBlock",
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
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserMaxProposalsChanged",
    inputs: [
      {
        name: "oldValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
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
    name: "VotingPeriodChanged",
    inputs: [
      {
        name: "oldValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
