declare const _default: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "addExternalChainConfigs";
    readonly inputs: readonly [{
        readonly name: "_trustedSenders";
        readonly type: "tuple[]";
        readonly internalType: "struct WormholeTrustedSender.TrustedSender[]";
        readonly components: readonly [{
            readonly name: "chainId";
            readonly type: "uint16";
            readonly internalType: "uint16";
        }, {
            readonly name: "addr";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "breakGlassGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bridgeCost";
    readonly inputs: readonly [{
        readonly name: "dstWormholeChainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [{
        readonly name: "gasCost";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bridgeCostAll";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "cancel";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "castVote";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "voteValue";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "chainAddressVotes";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "wormholeChainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [{
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "chainVoteCollectorVotes";
    readonly inputs: readonly [{
        readonly name: "wormholeChainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "crossChainVoteCollectionPeriod";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "currentUserLiveProposals";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "distributor";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SnapshotInterface";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "execute";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executeBreakGlass";
    readonly inputs: readonly [{
        readonly name: "targets";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "fromWormholeFormat";
    readonly inputs: readonly [{
        readonly name: "whFormatAddress";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "gasLimit";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint96";
        readonly internalType: "uint96";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getAllTargetChains";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint16[]";
        readonly internalType: "uint16[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getAllTargetChainsLength";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getCurrentVotes";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getNumLiveProposals";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "count";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getProposalData";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "targets";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }, {
        readonly name: "values";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getReceipt";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "voter";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "hasVoted";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "voteValue";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "votes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getUserLiveProposals";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getVotes";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "blockNumber";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "initData";
        readonly type: "tuple";
        readonly internalType: "struct MultichainGovernor.InitializeData";
        readonly components: readonly [{
            readonly name: "well";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "xWell";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "stkWell";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "distributor";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "proposalThreshold";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "votingPeriodSeconds";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "crossChainVoteCollectionPeriod";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "quorum";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "maxUserLiveProposals";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "pauseDuration";
            readonly type: "uint128";
            readonly internalType: "uint128";
        }, {
            readonly name: "pauseGuardian";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "breakGlassGuardian";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "wormholeRelayer";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly name: "trustedSenders";
        readonly type: "tuple[]";
        readonly internalType: "struct WormholeTrustedSender.TrustedSender[]";
        readonly components: readonly [{
            readonly name: "chainId";
            readonly type: "uint16";
            readonly internalType: "uint16";
        }, {
            readonly name: "addr";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "isTrustedSender";
    readonly inputs: readonly [{
        readonly name: "chainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "addr";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isTrustedSender";
    readonly inputs: readonly [{
        readonly name: "chainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "addr";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "kickGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "liveProposals";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxUserLiveProposals";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "pauseDuration";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pauseGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pauseStartTime";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pauseUsed";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "processedNonces";
    readonly inputs: readonly [{
        readonly name: "nonce";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "processed";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposalActive";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposalCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposalInformation";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "proposer";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "voteSnapshotTimestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "votingStartTime";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "endTimestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "crossChainVoteCollectionEndTimestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "totalVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposalThreshold";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposalVotes";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "totalVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposals";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "proposer";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "voteSnapshotTimestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "votingStartTime";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "votingEndTime";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "crossChainVoteCollectionEndTimestamp";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "voteSnapshotBlock";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "totalVotes";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "canceled";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "executed";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "propose";
    readonly inputs: readonly [{
        readonly name: "targets";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }, {
        readonly name: "values";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }, {
        readonly name: "description";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "quorum";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "rebroadcastProposal";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "receiveWormholeMessages";
    readonly inputs: readonly [{
        readonly name: "payload";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }, {
        readonly name: "senderAddress";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "sourceChain";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "nonce";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "removeExternalChainConfigs";
    readonly inputs: readonly [{
        readonly name: "_trustedSenders";
        readonly type: "tuple[]";
        readonly internalType: "struct WormholeTrustedSender.TrustedSender[]";
        readonly components: readonly [{
            readonly name: "chainId";
            readonly type: "uint16";
            readonly internalType: "uint16";
        }, {
            readonly name: "addr";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setBreakGlassGuardian";
    readonly inputs: readonly [{
        readonly name: "newGuardian";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setGasLimit";
    readonly inputs: readonly [{
        readonly name: "newGasLimit";
        readonly type: "uint96";
        readonly internalType: "uint96";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setNewStakedWell";
    readonly inputs: readonly [{
        readonly name: "newStakedWell";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "toUseTimestamps";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "state";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "enum IMultichainGovernor.ProposalState";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "stkWell";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SnapshotInterface";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "targetAddress";
    readonly inputs: readonly [{
        readonly name: "chainId";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "unpause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateApprovedCalldata";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "approved";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateCrossChainVoteCollectionPeriod";
    readonly inputs: readonly [{
        readonly name: "newCrossChainVoteCollectionPeriod";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateMaxUserLiveProposals";
    readonly inputs: readonly [{
        readonly name: "newMaxLiveProposals";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateProposalThreshold";
    readonly inputs: readonly [{
        readonly name: "newProposalThreshold";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateQuorum";
    readonly inputs: readonly [{
        readonly name: "newQuorum";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateVotingPeriod";
    readonly inputs: readonly [{
        readonly name: "newVotingPeriod";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "useTimestamps";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "votingPeriod";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "well";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SnapshotInterface";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "whitelistedCalldatas";
    readonly inputs: readonly [{
        readonly name: "whitelistedCalldata";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "wormholeRelayer";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IWormholeRelayer";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "xWell";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract xWELL";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "BreakGlassExecuted";
    readonly inputs: readonly [{
        readonly name: "breakGlassGuardian";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "targets";
        readonly type: "address[]";
        readonly indexed: false;
        readonly internalType: "address[]";
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly indexed: false;
        readonly internalType: "bytes[]";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BreakGlassGuardianChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "newValue";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BridgeOutFailed";
    readonly inputs: readonly [{
        readonly name: "dstChainId";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "payload";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }, {
        readonly name: "refundAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BridgeOutSuccess";
    readonly inputs: readonly [{
        readonly name: "dstWormholeChainId";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "cost";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "dst";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "payload";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CalldataApprovalUpdated";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }, {
        readonly name: "approved";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CrossChainVoteCollected";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "sourceChain";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "forVotes";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "againstVotes";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "abstainVotes";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CrossChainVoteCollectionPeriodChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "GasLimitUpdated";
    readonly inputs: readonly [{
        readonly name: "oldGasLimit";
        readonly type: "uint96";
        readonly indexed: false;
        readonly internalType: "uint96";
    }, {
        readonly name: "newGasLimit";
        readonly type: "uint96";
        readonly indexed: false;
        readonly internalType: "uint96";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "GovernanceReturnAddressChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "newValue";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "NewStakedWellSet";
    readonly inputs: readonly [{
        readonly name: "newStakedWell";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "toUseTimestamps";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PauseDurationUpdated";
    readonly inputs: readonly [{
        readonly name: "oldPauseDuration";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newPauseDuration";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PauseGuardianUpdated";
    readonly inputs: readonly [{
        readonly name: "oldPauseGuardian";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newPauseGuardian";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PauseTimeUpdated";
    readonly inputs: readonly [{
        readonly name: "newPauseStartTime";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Paused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalCanceled";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalCreated";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "proposer";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "targets";
        readonly type: "address[]";
        readonly indexed: false;
        readonly internalType: "address[]";
    }, {
        readonly name: "values";
        readonly type: "uint256[]";
        readonly indexed: false;
        readonly internalType: "uint256[]";
    }, {
        readonly name: "calldatas";
        readonly type: "bytes[]";
        readonly indexed: false;
        readonly internalType: "bytes[]";
    }, {
        readonly name: "votingStartTime";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "votingEndTime";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "description";
        readonly type: "string";
        readonly indexed: false;
        readonly internalType: "string";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalExecuted";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalQueued";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "eta";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalRebroadcasted";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProposalThresholdChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "QuroumVotesChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "StartBlockSet";
    readonly inputs: readonly [{
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "startBlock";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TargetAddressUpdated";
    readonly inputs: readonly [{
        readonly name: "dstChainId";
        readonly type: "uint16";
        readonly indexed: true;
        readonly internalType: "uint16";
    }, {
        readonly name: "target";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Unpaused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "UserMaxProposalsChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "VoteCast";
    readonly inputs: readonly [{
        readonly name: "voter";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "proposalId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "voteValue";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "votes";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "VotingPeriodChanged";
    readonly inputs: readonly [{
        readonly name: "oldValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];
export default _default;
//# sourceMappingURL=multichainGovernorAbi.d.ts.map