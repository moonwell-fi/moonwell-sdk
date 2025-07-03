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
  type ResponseType = {
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
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
      votes: {
        items: {
          id: string;
          voter: string;
          proposalId: string;
          proposal: {
            chainId: number;
          };
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
      collectorVotes: {
        items: {
          id: string;
          voter: string;
          proposalId: string;
          proposal: {
            chainId: number;
          };
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    };
  };

  let hasNextPageVotes = true;
  let hasNextPageCollectorVotes = true;
  let hasNextPageProposers = true;
  let endCursorVotes: string | undefined;
  let endCursorCollectorVotes: string | undefined;
  let endCursorProposers: string | undefined;
  const MAX_PAGES = 8;
  let pageCount = 0;

  const votes: ResponseType["data"]["votes"]["items"] = [];
  const collectorVotes: ResponseType["data"]["collectorVotes"]["items"] = [];
  const proposers: ResponseType["data"]["proposers"]["items"] = [];

  while (
    (hasNextPageVotes || hasNextPageCollectorVotes || hasNextPageProposers) &&
    pageCount < MAX_PAGES
  ) {
    pageCount++;
    const response: { data: ResponseType } = await axios.post(
      publicEnvironments.moonbeam.governanceIndexerUrl,
      {
        query: `
        query {
          ${
            hasNextPageProposers
              ? `
          proposers(
            where: {id_in: [${params.users.map((r) => `"${r.toLowerCase()}"`).join(",")}]}
            limit: 1000
            ${endCursorProposers ? `after: "${endCursorProposers}"` : ""}
          ) {
            items {
              id
              proposals(limit: 1000) {
                items {
                  chainId
                  proposalId
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          `
              : ""
          }
          ${
            hasNextPageVotes
              ? `
          votes(
            where: {voter_in: [${params.users.map((r) => `"${r.toLowerCase()}"`).join(",")}]}
            limit: 1000
            ${endCursorVotes ? `after: "${endCursorVotes}"` : ""}
          ) {
            items {
              id
              voter
              proposalId
              proposal {
                chainId
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          `
              : ""
          }
          ${
            hasNextPageCollectorVotes
              ? `
          collectorVotes(
            where: {voter_in: [${params.users.map((r) => `"${r.toLowerCase()}"`).join(",")}]}
            limit: 1000
            ${endCursorCollectorVotes ? `after: "${endCursorCollectorVotes}"` : ""}
          ) {
            items {
              id
              voter
              proposalId
              proposal {
                chainId
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          `
              : ""
          }
        }
      `,
      },
    );

    if (hasNextPageProposers && response.data?.data?.proposers) {
      proposers.push(...response.data.data.proposers.items);
      hasNextPageProposers = response.data.data.proposers.pageInfo.hasNextPage;
      endCursorProposers = response.data.data.proposers.pageInfo.endCursor;
    }

    if (hasNextPageVotes && response.data?.data?.votes) {
      votes.push(...response.data.data.votes.items);
      hasNextPageVotes = response.data.data.votes.pageInfo.hasNextPage;
      endCursorVotes = response.data.data.votes.pageInfo.endCursor;
    }

    if (hasNextPageCollectorVotes && response.data?.data?.collectorVotes) {
      collectorVotes.push(...response.data.data.collectorVotes.items);
      hasNextPageCollectorVotes =
        response.data.data.collectorVotes.pageInfo.hasNextPage;
      endCursorCollectorVotes =
        response.data.data.collectorVotes.pageInfo.endCursor;
    }
  }

  const response: ResponseType = {
    data: {
      proposers: {
        items: proposers,
        pageInfo: {
          hasNextPage: false,
          endCursor: "",
        },
      },
      votes: {
        items: votes,
        pageInfo: {
          hasNextPage: false,
          endCursor: "",
        },
      },
      collectorVotes: {
        items: collectorVotes,
        pageInfo: {
          hasNextPage: false,
          endCursor: "",
        },
      },
    },
  };

  if (response.data?.votes) {
    const allVotes = [
      ...(response.data?.votes?.items || []),
      ...(response.data?.collectorVotes?.items || []),
    ];

    // Group votes by voter and proposalId
    const uniqueVotesByProposal = allVotes.reduce((acc, vote) => {
      const key = `${vote.voter.toLowerCase()}-${vote.proposalId}`;
      if (!acc.has(key)) {
        acc.set(key, vote);
      }
      return acc;
    }, new Map<string, (typeof allVotes)[0]>());

    const voters = Array.from(uniqueVotesByProposal.values()).reduce(
      (prevVotes, currVotes) => {
        const previousVotes =
          prevVotes[currVotes.voter.toLowerCase()]?.[
            currVotes.proposal.chainId
          ] || 0;
        return {
          ...prevVotes,
          [currVotes.voter.toLowerCase()]: {
            ...(prevVotes[currVotes.voter.toLowerCase()] || {}),
            [currVotes.proposal.chainId]: previousVotes + 1,
          },
        };
      },
      {} as { [voter: string]: { [chainId: string]: number } },
    );

    const proposers = response?.data?.proposers?.items.reduce(
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
