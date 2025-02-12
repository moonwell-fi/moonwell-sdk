import axios from "axios";
import { isAddress } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { HttpRequestError } from "../../common/index.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";
import * as logger from "../../logger/console.js";
import type { Delegate } from "../../types/delegate.js";

export type GetDelegatesErrorType = HttpRequestError;

export type GetDelegatesReturnType = Promise<Delegate[]>;

/**
 * Returns a list of the delegates from the Moonwell Governance Forum
 *
 * https://forum.moonwell.fi/c/delegation-pitch/17
 */
export async function getDelegates(
  client: MoonwellClient,
): GetDelegatesReturnType {
  let users: Delegate[] = [];

  const logId = logger.start("getDelegates", "Starting to get delegates...");

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
            "1": { value: string[] };
            "2": { value: string[] };
            "3": { value: string[] };
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
      `https://forum.moonwell.fi/directory_items.json?period=all&order=Delegate+Wallet+Address&user_field_ids=2%7C1%7C3&page=${page}`,
    );

    if (response.status !== 200 || !response.data) {
      throw new HttpRequestError(response.statusText);
    }

    const results = response.data.directory_items
      .filter(
        (item) =>
          item.user.user_fields["1"] !== undefined &&
          item.user.user_fields["1"].value !== undefined &&
          item.user.user_fields["1"].value[0] !== undefined &&
          isAddress(item.user.user_fields["1"].value[0]) &&
          item.user.user_fields["2"] !== undefined &&
          item.user.user_fields["2"].value !== undefined &&
          item.user.user_fields["2"].value[0] !== undefined,
      )
      .map((item) => {
        const avatar = item.user.avatar_template.replace("{size}", "160");
        const result: Delegate = {
          avatar: avatar.startsWith("/user_avatar")
            ? `https://dub1.discourse-cdn.com/flex017${avatar}`
            : avatar,
          name: item.user.username,
          wallet: item.user.user_fields["1"].value[0],
          pitch: {
            intro: item.user.user_fields["2"].value[0],
            url: item.user.user_fields["3"]?.value[0],
          },
        };
        return result;
      });

    users = users.concat(results);

    const loadMore = response.data.directory_items.length > 0;
    if (loadMore) {
      await getUsersPaginated(page + 1);
    }
  };

  await getUsersPaginated();

  //Get how many proposals the delegate have voted for
  const proposals = await getDelegatesExtendedData({
    users: users.map((r) => r.wallet),
  });
  //Get delegate voting powers
  const envs = Object.values(client.environments as Environment[]).filter(
    (env) => env.contracts.views !== undefined,
  );

  const votingPowers = await Promise.all(
    users.map(async (user) =>
      Promise.all(
        envs.map((environment) =>
          environment.contracts.views?.read.getUserVotingPower([
            user.wallet as `0x${string}`,
          ]),
        ),
      ),
    ),
  );

  logger.end(logId);

  users = users.map((user, index) => {
    let votingPower: {
      [chainId: string]: number;
    } = {};

    const userVotingPowers = votingPowers[index];
    if (userVotingPowers) {
      votingPower = envs.reduce(
        (prev, curr, reduceIndex) => {
          const { claimsVotes, stakingVotes, tokenVotes } =
            userVotingPowers[reduceIndex]!;

          const totalVotes =
            claimsVotes.delegatedVotingPower +
            stakingVotes.delegatedVotingPower +
            tokenVotes.delegatedVotingPower;

          return {
            ...prev,
            [curr.chainId]: Number(totalVotes / BigInt(10 ** 18)),
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
  }>(publicEnvironments.moonbeam.governanceIndexerUrl, {
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
        const chains = [
          ...Object.keys(proposalsCreated || {}),
          ...Object.keys(proposalsVoted || {}),
        ];

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
