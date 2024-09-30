declare const _default: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "timelock_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "well_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "distributor_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "safetyModule_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "breakGlassGuardian_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "governanceReturnAddress_";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "governanceReturnGuardian_";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "guardianSunset_";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "oldValue";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newValue";
        readonly type: "address";
    }];
    readonly name: "BreakGlassGuardianChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "oldValue";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newValue";
        readonly type: "address";
    }];
    readonly name: "GovernanceReturnAddressChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "ProposalCanceled";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "proposer";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address[]";
        readonly name: "targets";
        readonly type: "address[]";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256[]";
        readonly name: "values";
        readonly type: "uint256[]";
    }, {
        readonly indexed: false;
        readonly internalType: "string[]";
        readonly name: "signatures";
        readonly type: "string[]";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes[]";
        readonly name: "calldatas";
        readonly type: "bytes[]";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "startTimestamp";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "endTimestamp";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "description";
        readonly type: "string";
    }];
    readonly name: "ProposalCreated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "ProposalExecuted";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "ProposalMaxOperationsChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "eta";
        readonly type: "uint256";
    }];
    readonly name: "ProposalQueued";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "ProposalThresholdChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "QuroumVotesChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "startBlock";
        readonly type: "uint256";
    }];
    readonly name: "StartBlockSet";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "voter";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "voteValue";
        readonly type: "uint8";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "votes";
        readonly type: "uint256";
    }];
    readonly name: "VoteCast";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "VotingDelayChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "VotingPeriodChanged";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "BALLOT_TYPEHASH";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_TYPEHASH";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "__acceptAdminOnTimelock";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeAcceptAdminOnContract";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract ChangeAdminInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnChangeAdmin";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract CompoundSetPendingAdminInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnCompound";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract SetEmissionsManagerInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnEmissionsManager";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract OwnableInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnOwnable";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract SetAdminInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnSetAdmin";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract SetPendingAdminInterface[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeBreakGlassOnSetPendingAdmin";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "addresses";
        readonly type: "address[]";
    }];
    readonly name: "__executeCompoundAcceptAdminOnContract";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "__removeGuardians";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "governanceReturnAddress_";
        readonly type: "address";
    }];
    readonly name: "__setGovernanceReturnAddress";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "breakGlassGuardian";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }];
    readonly name: "cancel";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "voteValue";
        readonly type: "uint8";
    }];
    readonly name: "castVote";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "voteValue";
        readonly type: "uint8";
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
    }];
    readonly name: "castVoteBySig";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "distributor";
    readonly outputs: readonly [{
        readonly internalType: "contract SnapshotInterface";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }];
    readonly name: "execute";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }];
    readonly name: "getActions";
    readonly outputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "targets";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "values";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "string[]";
        readonly name: "signatures";
        readonly type: "string[]";
    }, {
        readonly internalType: "bytes[]";
        readonly name: "calldatas";
        readonly type: "bytes[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "voter";
        readonly type: "address";
    }];
    readonly name: "getReceipt";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bool";
            readonly name: "hasVoted";
            readonly type: "bool";
        }, {
            readonly internalType: "uint8";
            readonly name: "voteValue";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "votes";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MoonwellGovernorArtemis.Receipt";
        readonly name: "";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "governanceReturnAddress";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "governanceReturnGuardian";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "guardianSunset";
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
    readonly name: "latestProposalIds";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "proposalCount";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "proposalMaxOperations";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "proposalThreshold";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "proposals";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "proposer";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "eta";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "startTimestamp";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "endTimestamp";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "startBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "forVotes";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "againstVotes";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "abstainVotes";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "totalVotes";
        readonly type: "uint256";
    }, {
        readonly internalType: "bool";
        readonly name: "canceled";
        readonly type: "bool";
    }, {
        readonly internalType: "bool";
        readonly name: "executed";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "targets";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "values";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "string[]";
        readonly name: "signatures";
        readonly type: "string[]";
    }, {
        readonly internalType: "bytes[]";
        readonly name: "calldatas";
        readonly type: "bytes[]";
    }, {
        readonly internalType: "string";
        readonly name: "description";
        readonly type: "string";
    }];
    readonly name: "propose";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }];
    readonly name: "queue";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "quorumVotes";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getQuorum";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "safetyModule";
    readonly outputs: readonly [{
        readonly internalType: "contract SnapshotInterface";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newGuardian";
        readonly type: "address";
    }];
    readonly name: "setBreakGlassGuardian";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "setProposalMaxOperations";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "setProposalThreshold";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "setQuorumVotes";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "setVotingDelay";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "newValue";
        readonly type: "uint256";
    }];
    readonly name: "setVotingPeriod";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "proposalId";
        readonly type: "uint256";
    }];
    readonly name: "state";
    readonly outputs: readonly [{
        readonly internalType: "enum MoonwellGovernorArtemis.ProposalState";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "tokenAddress";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "destinationAddress";
        readonly type: "address";
    }];
    readonly name: "sweepTokens";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "timelock";
    readonly outputs: readonly [{
        readonly internalType: "contract TimelockInterface";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "voteValueAbstain";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "voteValueNo";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "voteValueYes";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "votingDelay";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "votingPeriod";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "well";
    readonly outputs: readonly [{
        readonly internalType: "contract WellInterface";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
export default _default;
//# sourceMappingURL=governorAbi.d.ts.map