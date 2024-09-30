"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserVotingPowers = void 0;
const viem_1 = require("viem");
const index_js_1 = require("../../common/index.js");
async function getUserVotingPowers(params) {
    const tokenEnvironments = params.environments.filter((env) => env.custom?.governance?.token === params.governanceToken);
    const environmentsUserVotingPowers = await Promise.all(tokenEnvironments.map((environment) => environment.contracts.views?.read.getUserVotingPower([params.user])));
    return tokenEnvironments.map((environment, index) => {
        const votingPowers = environmentsUserVotingPowers[index];
        return {
            chainId: environment.chainId,
            claimsDelegates: votingPowers.claimsVotes.delegates,
            claimsBalance: new index_js_1.Amount(votingPowers.claimsVotes.votingPower, 18),
            claimsDelegated: new index_js_1.Amount(votingPowers.claimsVotes.delegatedVotingPower, 18),
            claimsDelegatedOthers: new index_js_1.Amount(votingPowers.claimsVotes.delegatedVotingPower -
                (votingPowers.claimsVotes.delegates === params.user
                    ? votingPowers.claimsVotes.votingPower
                    : 0n), 18),
            claimsDelegatedSelf: new index_js_1.Amount(votingPowers.claimsVotes.delegates === params.user
                ? votingPowers.claimsVotes.votingPower
                : 0n, 18),
            claimsUndelegated: new index_js_1.Amount(votingPowers.claimsVotes.delegates === viem_1.zeroAddress
                ? votingPowers.claimsVotes.votingPower
                : 0n, 18),
            tokenDelegates: votingPowers.tokenVotes.delegates,
            tokenBalance: new index_js_1.Amount(votingPowers.tokenVotes.votingPower, 18),
            tokenDelegated: new index_js_1.Amount(votingPowers.tokenVotes.delegatedVotingPower, 18),
            tokenDelegatedOthers: new index_js_1.Amount(votingPowers.tokenVotes.delegatedVotingPower -
                (votingPowers.tokenVotes.delegates === params.user
                    ? votingPowers.tokenVotes.votingPower
                    : 0n), 18),
            tokenDelegatedSelf: new index_js_1.Amount(votingPowers.tokenVotes.delegates === params.user
                ? votingPowers.tokenVotes.votingPower
                : 0n, 18),
            tokenUndelegated: new index_js_1.Amount(votingPowers.tokenVotes.delegates === viem_1.zeroAddress
                ? votingPowers.tokenVotes.votingPower
                : 0n, 18),
            stakingDelegated: new index_js_1.Amount(votingPowers.stakingVotes.delegatedVotingPower, 18),
            totalDelegated: new index_js_1.Amount(votingPowers.claimsVotes.delegatedVotingPower +
                votingPowers.tokenVotes.delegatedVotingPower +
                votingPowers.stakingVotes.delegatedVotingPower, 18),
            totalDelegatedOthers: new index_js_1.Amount(votingPowers.claimsVotes.delegatedVotingPower -
                (votingPowers.claimsVotes.delegates === params.user
                    ? votingPowers.claimsVotes.votingPower
                    : 0n) +
                (votingPowers.tokenVotes.delegatedVotingPower -
                    (votingPowers.tokenVotes.delegates === params.user
                        ? votingPowers.tokenVotes.votingPower
                        : 0n)), 18),
            totalDelegatedSelf: new index_js_1.Amount((votingPowers.claimsVotes.delegates === params.user
                ? votingPowers.claimsVotes.votingPower
                : 0n) +
                (votingPowers.tokenVotes.delegates === params.user
                    ? votingPowers.tokenVotes.votingPower
                    : 0n) +
                votingPowers.stakingVotes.delegatedVotingPower, 18),
        };
    });
}
exports.getUserVotingPowers = getUserVotingPowers;
//# sourceMappingURL=getUserVotingPowers.js.map