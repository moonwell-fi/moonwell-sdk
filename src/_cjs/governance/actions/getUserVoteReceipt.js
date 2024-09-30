"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserVoteReceipt = void 0;
const index_js_1 = require("../../common/index.js");
const index_js_2 = require("../../environments/index.js");
async function getUserVoteReceipt(params) {
    let isMultichain = false;
    let proposalId = params.id;
    const result = {};
    if (params.environment.contracts.multichainGovernor) {
        if (params.environment.custom?.governance?.proposalIdOffset) {
            if (params.id > params.environment.custom?.governance?.proposalIdOffset) {
                isMultichain = true;
                proposalId =
                    params.id - params.environment.custom?.governance?.proposalIdOffset;
            }
        }
    }
    if (isMultichain) {
        const governanceChainIds = params.environment.custom?.governance?.chainIds || [];
        const receipt = await params.environment.contracts.multichainGovernor?.read.getReceipt([
            BigInt(proposalId),
            params.account,
        ]);
        const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];
        result[params.environment.chainId] = {
            account: params.account,
            option: voteValue,
            voted: hasVoted,
            votes: new index_js_1.Amount(votes || 0, 18),
        };
        for (const chainId of governanceChainIds) {
            const multichainEnvironment = Object.values(index_js_2.publicEnvironments).find((r) => r.chainId === chainId);
            if (multichainEnvironment) {
                const receipt = await multichainEnvironment.contracts.voteCollector?.read.getReceipt([
                    BigInt(proposalId),
                    params.account,
                ]);
                const [hasVoted, voteValue, votes] = receipt || [false, 0, 0];
                result[multichainEnvironment.chainId] = {
                    account: params.account,
                    option: voteValue,
                    voted: hasVoted,
                    votes: new index_js_1.Amount(votes || 0, 18),
                };
            }
        }
    }
    else {
        const receipt = await params.environment.contracts.governor?.read.getReceipt([
            BigInt(proposalId),
            params.account,
        ]);
        result[params.environment.chainId] = {
            account: params.account,
            option: receipt?.voteValue || 0,
            voted: receipt?.hasVoted || false,
            votes: new index_js_1.Amount(receipt?.votes || 0, 18),
        };
    }
    return result;
}
exports.getUserVoteReceipt = getUserVoteReceipt;
//# sourceMappingURL=getUserVoteReceipt.js.map