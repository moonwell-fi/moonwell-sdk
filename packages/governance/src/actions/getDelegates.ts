import type { Delegate } from "@/types/delegate.js";
import { HttpRequestError } from "@moonwell-sdk/common";
import { environments, moonbeam } from "@moonwell-sdk/environments";
import type { Environment } from "@moonwell-sdk/environments";
import axios from "axios";
import { isAddress } from "viem";

export type GetDelegatesErrorType = HttpRequestError;

export type GetDelegatesReturnType = Delegate[];

/**
 * Returns a list of the delegates from the Moonwell Governance Forum
 *
 * https://forum.moonwell.fi/c/delegation-pitch/17
 */
export async function getDelegates(): Promise<GetDelegatesReturnType> {
  let users: Delegate[] = [];

  const getUsersPaginated = async (page = 0) => {
    const response = await axios.get<{
      directory_items: {
        user: {
          id: number;
          username: string;
          name: string;
          avatar_template: string;
          title: string;
          user_fields: {
            "1": string;
            "2": string;
            "3": string;
          };
          wallet_address: string;
          pitch_intro: string;
          pitch_link: string;
        };
      }[];
      meta: {
        total_rows_directory_items: number;
        load_more_directory_items: string;
      };
    }>(
      `https://forum.moonwell.fi/directory_items.json?period=all&order=Delegate+Wallet+Address&user_field_ids=2%7C1%7C3&plugin_column_ids=8&page=${page}`,
    );

    if (response.status !== 200 || !response.data) {
      throw new HttpRequestError(response.statusText);
    }

    const results = response.data.directory_items
      .filter((item) => item.user.user_fields[1] !== undefined && isAddress(item.user.user_fields[1]) && item.user.user_fields[2] !== null)
      .map((item) => {
        const avatar = item.user.avatar_template.replace("{size}", "160");
        const result: Delegate = {
          avatar: avatar.startsWith("/user_avatar") ? `https://dub1.discourse-cdn.com/standard20${avatar}` : avatar,
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

    if (!response.data.directory_items.some((r) => r.user.user_fields[1] === undefined)) {
      await getUsersPaginated(page + 1);
    }
  };

  await getUsersPaginated();

  //Get how many proposals the delegate have voted for
  const proposals = await getDelegatesExtendedData({
    users: users.map((r) => r.wallet),
  });

  //Get delegate voting powers
  const envs = [environments] as unknown as Environment[];

  const votingPowers = await Promise.all(
    users.map(async (user) =>
      Promise.all(envs.map((environment) => environment.contracts.core?.views?.read.getUserVotingPower([user.wallet as `0x${string}`]))),
    ),
  );

  users = users.map((user, index) => {
    let votingPower: {
      [chainId: string]: number;
    } = {};

    const userVotingPowers = votingPowers[index];
    if (userVotingPowers) {
      votingPower = envs.reduce(
        (prev, curr, reduceIndex) => {
          const { claimsVotes, stakingVotes, tokenVotes } = userVotingPowers[reduceIndex]!;

          const totalVotes = claimsVotes.delegatedVotingPower + stakingVotes.delegatedVotingPower + tokenVotes.delegatedVotingPower;

          return {
            ...prev,
            [curr.chain.id]: Number(totalVotes / BigInt(10 ** 18)),
          };
        },
        {} as { [chainId: string]: number },
      );
    }

    const extended: Delegate = {
      ...user,
      proposals: proposals[user.wallet.toLowerCase()],
      votingPower,
    };

    return extended;
  });

  return users;
}

/**
 * Helper function to get how many proposals the delegates have created and voted
 */
const getDelegatesExtendedData = async (params: {
  users: string[];
}) => {
  const response = await axios.post<{
    data: {
      proposers: {
        items: {
          id: string;
          proposals: {
            items: {
              proposalId: string;
              chainId: number;
            }[];
          };
        }[];
      };
      voters: {
        items: {
          id: string;
          votes: {
            items: {
              proposal: {
                chainId: number;
              };
            }[];
          };
        }[];
      };
    };
  }>(moonbeam.apis.indexerUrl, {
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
    const voters = response?.data?.data?.voters?.items.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.id.toLowerCase()]: curr.votes.items.reduce(
            (prevVotes, currVotes) => {
              const previousVotes = prevVotes[currVotes.proposal.chainId] || 0;
              return {
                ...prevVotes,
                [currVotes.proposal.chainId]: previousVotes + 1,
              };
            },
            {} as { [chainId: string]: number },
          ),
        };
      },
      {} as { [voter: string]: { [chainId: string]: number } },
    );

    const proposers = response?.data?.data?.proposers?.items.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.id.toLowerCase()]: curr.proposals.items.reduce(
            (prevVotes, currVotes) => {
              const previousProposed = prevVotes[currVotes.chainId] || 0;
              return {
                ...prevVotes,
                [currVotes.chainId]: previousProposed + 1,
              };
            },
            {} as { [chainId: string]: number },
          ),
        };
      },
      {} as { [proposer: string]: { [chainId: string]: number } },
    );

    return params.users.reduce(
      (prev, curr) => {
        const proposalsCreated = proposers[curr.toLowerCase()];
        const proposalsVoted = voters[curr.toLowerCase()];
        const chains = [...Object.keys(proposalsCreated || {}), ...Object.keys(proposalsVoted || {})];

        return {
          ...prev,
          [curr.toLowerCase()]: chains.reduce(
            (prevChain, currChain) => {
              return {
                ...prevChain,
                [currChain]: {
                  created: proposalsCreated?.[currChain] || 0,
                  voted: proposalsVoted?.[currChain] || 0,
                },
              };
            },
            {} as { [chainId: string]: { created: number; voted: number } },
          ),
        };
      },
      {} as {
        [user: string]: {
          [chainId: string]: { created: number; voted: number };
        };
      },
    );
  }
  return {};
};
