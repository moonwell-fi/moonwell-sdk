export var ProposalState;
(function (ProposalState) {
    ProposalState[ProposalState["Pending"] = 0] = "Pending";
    ProposalState[ProposalState["Active"] = 1] = "Active";
    ProposalState[ProposalState["Canceled"] = 2] = "Canceled";
    ProposalState[ProposalState["Defeated"] = 3] = "Defeated";
    ProposalState[ProposalState["Succeeded"] = 4] = "Succeeded";
    ProposalState[ProposalState["Queued"] = 5] = "Queued";
    ProposalState[ProposalState["Expired"] = 6] = "Expired";
    ProposalState[ProposalState["Executed"] = 7] = "Executed";
    ProposalState[ProposalState["MultichainQueued"] = 8] = "MultichainQueued";
    ProposalState[ProposalState["MultichainExecuted"] = 9] = "MultichainExecuted";
})(ProposalState || (ProposalState = {}));
//@internal
export var MultichainProposalState;
(function (MultichainProposalState) {
    MultichainProposalState[MultichainProposalState["Active"] = 0] = "Active";
    MultichainProposalState[MultichainProposalState["MultichainVoteCollection"] = 1] = "MultichainVoteCollection";
    MultichainProposalState[MultichainProposalState["Canceled"] = 2] = "Canceled";
    MultichainProposalState[MultichainProposalState["Defeated"] = 3] = "Defeated";
    MultichainProposalState[MultichainProposalState["Succeeded"] = 4] = "Succeeded";
    MultichainProposalState[MultichainProposalState["Executed"] = 5] = "Executed";
})(MultichainProposalState || (MultichainProposalState = {}));
//@internal
export const MultichainProposalStateMapping = {
    [MultichainProposalState.Active]: ProposalState.Active,
    [MultichainProposalState.MultichainVoteCollection]: ProposalState.Queued,
    [MultichainProposalState.Canceled]: ProposalState.Canceled,
    [MultichainProposalState.Defeated]: ProposalState.Defeated,
    [MultichainProposalState.Succeeded]: ProposalState.Succeeded,
    [MultichainProposalState.Executed]: ProposalState.Executed,
};
//# sourceMappingURL=proposal.js.map