"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelegates = void 0;
const axios_1 = require("axios");
const viem_1 = require("viem");
const index_js_1 = require("../../common/index.js");
const index_js_2 = require("../../environments/index.js");
async function getDelegates() {
    let users = [];
    const getUsersPaginated = async (page = 0) => {
        const response = await axios_1.default.get(`https://forum.moonwell.fi/directory_items.json?period=all&order=Delegate+Wallet+Address&user_field_ids=2%7C1%7C3&plugin_column_ids=8&page=${page}`);
        if (response.status !== 200 || !response.data) {
            throw new index_js_1.HttpRequestError(response.statusText);
        }
        const results = response.data.directory_items
            .filter((item) => item.user.user_fields[1] !== undefined &&
            (0, viem_1.isAddress)(item.user.user_fields[1]) &&
            item.user.user_fields[2] !== null)
            .map((item) => {
            const avatar = item.user.avatar_template.replace("{size}", "160");
            const result = {
                avatar: avatar.startsWith("/user_avatar")
                    ? `https://dub1.discourse-cdn.com/standard20${avatar}`
                    : avatar,
                name: item.user.username,
                wallet: item.user.user_fields[1],
                pitch: {
                    intro: item.user.user_fields[2],
                    url: item.user.user_fields[3],
                },
            };
            return result;
        });
        users = users.concat(results);
        if (response.data.directory_items.filter((r) => r.user.user_fields[1] === undefined).length > 0) {
            await getUsersPaginated(page + 1);
        }
    };
    await getUsersPaginated();
    const proposals = await getDelegatesExtendedData({
        users: users.map((r) => r.wallet),
    });
    const envs = Object.values(index_js_2.publicEnvironments);
    const votingPowers = await Promise.all(users.map(async (user) => Promise.all(envs.map((environment) => environment.contracts.views?.read.getUserVotingPower([
        user.wallet,
    ])))));
    users = users.map((user, index) => {
        let votingPower = {};
        const userVotingPowers = votingPowers[index];
        if (userVotingPowers) {
            votingPower = envs.reduce((prev, curr, reduceIndex) => {
                const { claimsVotes, stakingVotes, tokenVotes } = userVotingPowers[reduceIndex];
                const totalVotes = claimsVotes.delegatedVotingPower +
                    stakingVotes.delegatedVotingPower +
                    tokenVotes.delegatedVotingPower;
                return {
                    ...prev,
                    [curr.chainId]: Number(totalVotes / BigInt(10 ** 18)),
                };
            }, {});
        }
        const extended = {
            ...user,
            proposals: proposals[user.wallet.toLowerCase()],
            votingPower,
        };
        return extended;
    });
    return users;
}
exports.getDelegates = getDelegates;
const getDelegatesExtendedData = async (params) => {
    const response = await axios_1.default.post(index_js_2.publicEnvironments.moonbeam.indexerUrl, {
        query: `
      query {
        proposers(where: {id_in: [${params.users.map((r) => `"${r.toLowerCase()}"`).join(",")}]}) {
          items {
            id
            proposals(limit: 1000) {
              items {
                chainId
                proposalId
              }
            }
          }
        }
        voters(where: {id_in: [${params.users.map((r) => `"${r.toLowerCase()}"`).join(",")}]}) {
          items {
            id
            votes(limit: 1000) {
              items {
                voter
                proposal {
                  chainId
                }
              }
            }
          }
        }
      }
    `,
    });
    if (response.status === 200 && response.data?.data?.voters) {
        const voters = response?.data?.data?.voters?.items.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.id.toLowerCase()]: curr.votes.items.reduce((prevVotes, currVotes) => {
                    const previousVotes = prevVotes[currVotes.proposal.chainId] || 0;
                    return {
                        ...prevVotes,
                        [currVotes.proposal.chainId]: previousVotes + 1,
                    };
                }, {}),
            };
        }, {});
        const proposers = response?.data?.data?.proposers?.items.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.id.toLowerCase()]: curr.proposals.items.reduce((prevVotes, currVotes) => {
                    const previousProposed = prevVotes[currVotes.chainId] || 0;
                    return {
                        ...prevVotes,
                        [currVotes.chainId]: previousProposed + 1,
                    };
                }, {}),
            };
        }, {});
        return params.users.reduce((prev, curr) => {
            const proposalsCreated = proposers[curr.toLowerCase()];
            const proposalsVoted = voters[curr.toLowerCase()];
            const chains = [
                ...Object.keys(proposalsCreated || {}),
                ...Object.keys(proposalsVoted || {}),
            ];
            return {
                ...prev,
                [curr.toLowerCase()]: chains.reduce((prevChain, currChain) => {
                    return {
                        ...prevChain,
                        [currChain]: {
                            created: proposalsCreated?.[currChain] || 0,
                            voted: proposalsVoted?.[currChain] || 0,
                        },
                    };
                }, {}),
            };
        }, {});
    }
    return {};
};
//# sourceMappingURL=getDelegates.js.map