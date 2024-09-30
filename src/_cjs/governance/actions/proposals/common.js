"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtendedProposalData = exports.getCrossChainProposalData = exports.getProposalData = exports.appendProposalExtendedData = void 0;
const axios_1 = require("axios");
const lodash_1 = require("lodash");
const chains_1 = require("viem/chains");
const index_js_1 = require("../../../common/index.js");
const index_js_2 = require("../../../environments/index.js");
const proposal_js_1 = require("../../types/proposal.js");
axios_1.default.defaults.timeout = 5000;
const appendProposalExtendedData = (proposals, extendedDatas) => {
    proposals.forEach((proposal) => {
        const extendedData = extendedDatas.find((item) => item.id === proposal.id);
        if (extendedData) {
            const lastProposalUpdate = (0, lodash_1.first)((0, lodash_1.last)(extendedData.stateChanges)?.messages);
            if (lastProposalUpdate && lastProposalUpdate.timestamp > 0) {
                const now = Math.floor(Date.now() / 1000);
                if (lastProposalUpdate.timestamp + 60 * 60 * 24 > now) {
                    proposal.state = proposal_js_1.ProposalState.MultichainQueued;
                }
                else {
                    proposal.state = proposal_js_1.ProposalState.MultichainExecuted;
                }
            }
            proposal.title = extendedData.title;
            proposal.calldatas = extendedData.calldatas;
            proposal.description = extendedData.description;
            proposal.signatures = extendedData.signatures;
            proposal.stateChanges = extendedData.stateChanges;
            proposal.subtitle = extendedData.subtitle;
            proposal.targets = extendedData.targets;
        }
    });
};
exports.appendProposalExtendedData = appendProposalExtendedData;
const extractProposalSubtitle = (input) => {
    const lines = input.split("\n");
    const h1Line = lines.find((line) => line.startsWith("#"));
    if (!h1Line) {
        return input ? input.substring(0, 100) : "";
    }
    let result = h1Line.substring(1).trim();
    const h2Index = result.indexOf("##");
    if (h2Index !== -1) {
        result = result.substring(0, h2Index).trim();
    }
    result = result.replace(/\\n/g, "").trim();
    if (result.length > 80) {
        result = `${result.substring(0, 80)}...`;
    }
    if (result.includes("Moonbeam")) {
        result = result.replace("MIP-B", "MIP-M");
    }
    if (result.indexOf("MIP-B22: Gauntlet") >= 0) {
        result = result.replace("MIP-B22", "MIP-B24");
    }
    if (result.indexOf("MIP-O01: Gauntlet") >= 0) {
        result = result.replace("MIP-O01", "MIP-O03");
    }
    if (result.indexOf("MIP-M02: Upgrade") >= 0) {
        result = result.replace("MIP-M02", "MIP-M03");
    }
    if (result.indexOf("MIP-R02: Upgrade") >= 0) {
        result = result.replace("MIP-R02", "MIP-R03");
    }
    if (result.indexOf("Proposal: Onboard wstETH") >= 0) {
        result = result.replace("Proposal:", "MIP-B08");
    }
    if (result.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0) {
        result = result.replace("Gauntlet", "MIP-R10: Gauntlet");
    }
    return result;
};
const getProposalData = async (params) => {
    if (params.environment.contracts.governor) {
        let count = 0n;
        let quorum = 0n;
        if (params.environment.chainId === chains_1.moonriver.id) {
            [count, quorum] = await Promise.all([
                params.environment.contracts.governor.read.proposalCount(),
                params.environment.contracts.governor.read.getQuorum(),
            ]);
        }
        else {
            [count, quorum] = await Promise.all([
                params.environment.contracts.governor.read.proposalCount(),
                params.environment.contracts.governor.read.quorumVotes(),
            ]);
        }
        if (params.id) {
            if (BigInt(params.id) > count) {
                return [];
            }
        }
        const ids = params.id
            ? [BigInt(params.id)]
            : Array.from({ length: Number(count) }, (_, i) => count - BigInt(i));
        const proposalDataCall = Promise.all(ids.map((id) => params.environment.contracts.governor?.read.proposals([id])));
        const proposalStateCall = Promise.all(ids.map((id) => params.environment.contracts.governor?.read.state([id])));
        const [proposalsData, proposalsState] = await Promise.all([
            proposalDataCall,
            proposalStateCall,
        ]);
        const proposals = proposalsData?.map((item, index) => {
            const state = proposalsState?.[index];
            const [id, proposer, eta, startTimestamp, endTimestamp, startBlock, forVotes, againstVotes, abstainVotes, totalVotes, canceled, executed,] = item;
            const proposal = {
                chainId: params.environment.chainId,
                id: Number(id),
                proposalId: Number(id),
                proposer,
                eta: Number(eta),
                startTimestamp: Number(startTimestamp),
                endTimestamp: Number(endTimestamp),
                startBlock: Number(startBlock),
                forVotes: new index_js_1.Amount(forVotes, 18),
                againstVotes: new index_js_1.Amount(againstVotes, 18),
                abstainVotes: new index_js_1.Amount(abstainVotes, 18),
                totalVotes: new index_js_1.Amount(totalVotes, 18),
                canceled,
                executed,
                quorum: new index_js_1.Amount(quorum, 18),
                state,
            };
            return proposal;
        });
        return proposals;
    }
    else {
        return [];
    }
};
exports.getProposalData = getProposalData;
const getCrossChainProposalData = async (params) => {
    if (params.environment.contracts.governor) {
        const xcGovernanceSettings = params.environment.custom.governance;
        if (params.environment.contracts.multichainGovernor &&
            xcGovernanceSettings &&
            xcGovernanceSettings.chainIds.length > 0) {
            const xcEnvironments = xcGovernanceSettings.chainIds
                .map((chainId) => Object.values(index_js_2.publicEnvironments).find((env) => env.chainId === chainId))
                .filter((xcEnvironment) => !!xcEnvironment)
                .filter((xcEnvironment) => xcEnvironment.custom?.wormhole?.chainId &&
                xcEnvironment.contracts.voteCollector);
            const [xcCount, xcQuorum] = await Promise.all([
                params.environment.contracts.multichainGovernor.read.proposalCount(),
                params.environment.contracts.multichainGovernor.read.quorum(),
            ]);
            if (params.id) {
                params.id =
                    Number(params.id) -
                        (params.environment.custom?.governance?.proposalIdOffset || 0);
                if (params.id < 0) {
                    return [];
                }
                else {
                    if (BigInt(params.id) > xcCount) {
                        return [];
                    }
                }
            }
            const xcIds = params.id
                ? [BigInt(params.id)]
                : Array.from({ length: Number(xcCount) }, (_, i) => xcCount - BigInt(i));
            const xcProposalsDataCall = Promise.all(xcIds.map((id) => params.environment.contracts.multichainGovernor?.read.proposals([id])));
            const xcProposalsStateCall = Promise.all(xcIds.map((id) => params.environment.contracts.multichainGovernor?.read.state([id])));
            const xcProposalsCollectedVotes = xcEnvironments.map((xcEnvironment) => {
                return Promise.all(xcIds.map((id) => params.environment.contracts.multichainGovernor.read.chainVoteCollectorVotes([xcEnvironment.custom.wormhole.chainId, id])));
            });
            const xcProposalsVotes = xcEnvironments.map((xcEnvironment) => {
                return Promise.all(xcIds.map((id) => xcEnvironment.contracts.voteCollector.read.proposalVotes([id])));
            });
            const [xcProposalsData, xcProposalsState, xcCollectorVotes, xcVotes] = await Promise.all([
                xcProposalsDataCall,
                xcProposalsStateCall,
                Promise.all(xcProposalsCollectedVotes),
                Promise.all(xcProposalsVotes),
            ]);
            const proposals = xcIds.map((xcId, proposalIndex) => {
                const id = Number(xcId) +
                    (params.environment.custom?.governance?.proposalIdOffset || 0);
                const state = xcProposalsState?.[proposalIndex];
                const votesCollected = xcCollectorVotes.reduce((prevCollected, currentCollected, i) => {
                    const [votesFor, votesAgainst, votesAbstain] = currentCollected[proposalIndex];
                    const collected = votesFor > 0n || votesAgainst > 0n || votesAbstain > 0n;
                    return i === 0
                        ? collected
                        : prevCollected === false
                            ? false
                            : collected;
                }, false);
                const votes = xcVotes.reduce((prevVotes, currVotes) => {
                    const [totalVotes, forVotes, againstVotes, abstainVotes] = currVotes[proposalIndex];
                    return {
                        totalVotes: prevVotes.totalVotes + totalVotes,
                        forVotes: prevVotes.forVotes + forVotes,
                        againstVotes: prevVotes.againstVotes + againstVotes,
                        abstainVotes: prevVotes.abstainVotes + abstainVotes,
                    };
                }, { totalVotes: 0n, forVotes: 0n, againstVotes: 0n, abstainVotes: 0n });
                const [proposer, _voteSnapshotTimestamp, votingStartTime, votingEndTime, crossChainVoteCollectionEndTimestamp, voteSnapshotBlock, forVotes, againstVotes, abstainVotes, totalVotes, canceled, executed,] = xcProposalsData?.[proposalIndex];
                const multichainState = proposal_js_1.MultichainProposalStateMapping[state];
                const proposal = {
                    chainId: params.environment.chainId,
                    id,
                    proposalId: Number(xcId),
                    proposer,
                    eta: Number(crossChainVoteCollectionEndTimestamp),
                    startTimestamp: Number(votingStartTime),
                    endTimestamp: Number(votingEndTime),
                    startBlock: Number(voteSnapshotBlock),
                    forVotes: new index_js_1.Amount(forVotes + votes.forVotes, 18),
                    againstVotes: new index_js_1.Amount(againstVotes + votes.againstVotes, 18),
                    abstainVotes: new index_js_1.Amount(abstainVotes + votes.abstainVotes, 18),
                    totalVotes: new index_js_1.Amount(totalVotes + votes.totalVotes, 18),
                    canceled,
                    executed,
                    quorum: new index_js_1.Amount(xcQuorum, 18),
                    state: multichainState,
                    multichain: {
                        id: Number(xcId),
                        votesCollected,
                    },
                };
                return proposal;
            });
            return proposals;
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }
};
exports.getCrossChainProposalData = getCrossChainProposalData;
const getExtendedProposalData = async (params) => {
    let result = [];
    let lastId = -1;
    let shouldContinue = true;
    while (shouldContinue) {
        const response = await axios_1.default.post(params.environment.indexerUrl, {
            query: `
          query {
            proposals(
              limit: 1000, 
              orderDirection: "desc", 
              orderBy: "proposalId", 
              where: { 
                chainId: ${params.environment.chainId}
                ${params.id ? `, proposalId: ${params.id}` : lastId >= 0 ? `, proposalId_lt: ${lastId}` : ""} 
              }
            ) {
              items {
                id
                proposalId
                description
                targets
                calldatas
                signatures
                stateChanges(orderBy: "blockNumber") {
                  items {
                    txnHash
                    blockNumber
                    newState
                    messages {
                      items {
                        timestamp
                        sequence
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        });
        if (response.status === 200 && response.data?.data?.proposals) {
            const proposals = response.data.data.proposals.items.map((item) => {
                const extendedProposalData = {
                    id: item.proposalId,
                    title: `Proposal #${item.proposalId}`,
                    subtitle: extractProposalSubtitle(item.description),
                    description: item.description,
                    calldatas: item.calldatas,
                    signatures: item.signatures,
                    stateChanges: item.stateChanges.items.map((change) => {
                        return {
                            blockNumber: change.blockNumber,
                            messages: change.messages.items.map((message) => message),
                            state: change.newState,
                            transactionHash: change.txnHash,
                        };
                    }),
                    targets: item.targets,
                };
                if (extendedProposalData.subtitle.includes("Moonbeam")) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-B", "MIP-M");
                }
                if (extendedProposalData.subtitle.indexOf("MIP-B22: Gauntlet") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-B22", "MIP-B24");
                }
                if (extendedProposalData.subtitle.indexOf("MIP-O01: Gauntlet") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-O01", "MIP-O03");
                }
                if (extendedProposalData.subtitle.indexOf("MIP-M02: Upgrade") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-M02", "MIP-M03");
                }
                if (extendedProposalData.subtitle.indexOf("MIP-R02: Upgrade") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-R02", "MIP-R03");
                }
                if (extendedProposalData.subtitle.indexOf("Proposal: Onboard wstETH") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("Proposal:", "MIP-B08");
                }
                if (extendedProposalData.subtitle.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("Gauntlet", "MIP-R10: Gauntlet");
                }
                if (extendedProposalData.description.substring(0, 9).includes("MIP-MIP")) {
                    extendedProposalData.description =
                        extendedProposalData.description.replace("MIP-", "");
                }
                if (extendedProposalData.subtitle.substring(0, 7).includes("MIP-MIP")) {
                    extendedProposalData.subtitle = extendedProposalData.subtitle.replace("MIP-", "");
                }
                return extendedProposalData;
            });
            if (proposals.length < 1000 || proposals.length === 0) {
                shouldContinue = false;
            }
            else {
                lastId = (0, lodash_1.last)(proposals).id;
            }
            result = result.concat(proposals);
        }
    }
    return result;
};
exports.getExtendedProposalData = getExtendedProposalData;
//# sourceMappingURL=common.js.map