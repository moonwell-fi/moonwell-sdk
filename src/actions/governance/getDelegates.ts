import axios from "axios";
import { isAddress } from "viem";
import { base, moonbeam, optimism } from "viem/chains";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  type Environment,
  publicEnvironments,
} from "../../environments/index.js";
import * as logger from "../../logger/console.js";
import type { Delegate } from "../../types/delegate.js";
import { fetchAllVoters } from "./governor-api-client.js";

export type GetDelegatesReturnType = Promise<Delegate[]>;

/**
 * Returns a list of delegates with voting power and activity stats
 * Data is fetched from Governor API, enriched with forum profiles and on-chain voting power
 * All delegates are returned sorted by total voting power
 * The app should handle pagination locally for better performance and caching
 */
export async function getDelegates(
  client: MoonwellClient,
): GetDelegatesReturnType {
  const logId = logger.start("getDelegates", "Starting to get delegates...");

  const governanceEnvironment = publicEnvironments.moonbeam;

  const apiVoters = await fetchAllVoters(governanceEnvironment);
  const forumProfiles = await getForumProfiles();

  const targetChainIds = [moonbeam.id, base.id, optimism.id] as const;
  const envs = Object.values(client.environments as Environment[]).filter(
    (env) =>
      env.contracts.views !== undefined &&
      (targetChainIds as readonly number[]).includes(env.chainId),
  );

  const votingPowers = await Promise.all(
    apiVoters.map(async (voter) =>
      Promise.all(
        envs.map((environment) =>
          environment.contracts.views?.read.getUserVotingPower([
            voter.id as `0x${string}`,
          ]),
        ),
      ),
    ),
  );

  let delegates: Delegate[] = apiVoters.map((voter, index) => {
    const forumProfile = forumProfiles.find(
      (p) => p.wallet.toLowerCase() === voter.id.toLowerCase(),
    );

    const votingPower: { [chainId: string]: number } = {};
    const userVotingPowers = votingPowers[index];
    if (userVotingPowers) {
      envs.forEach((env, reduceIndex) => {
        const { claimsVotes, stakingVotes, tokenVotes } =
          userVotingPowers[reduceIndex]!;

        const totalVotes =
          claimsVotes.delegatedVotingPower +
          stakingVotes.delegatedVotingPower +
          tokenVotes.delegatedVotingPower;

        votingPower[env.chainId] = Number(totalVotes / BigInt(10 ** 18));
      });
    }

    const delegate: Delegate = {
      avatar: forumProfile?.avatar || "",
      name: forumProfile?.name || voter.id,
      wallet: voter.id as `0x${string}`,
      pitch: forumProfile?.pitch || { intro: "", url: "" },
      proposals: {
        all: {
          created: voter.createdProposalIds.length,
          voted: voter.votedProposalIds.length,
        },
      },
      votingPower,
    };

    return delegate;
  });

  delegates = delegates.sort((a, b) => {
    const aTotalPower = Object.values(a.votingPower || {}).reduce(
      (sum, power) => sum + power,
      0,
    );
    const bTotalPower = Object.values(b.votingPower || {}).reduce(
      (sum, power) => sum + power,
      0,
    );

    return bTotalPower - aTotalPower;
  });

  logger.end(logId);

  return delegates;
}

/**
 * Helper function to fetch delegate profiles from forum
 */
const getForumProfiles = async () => {
  const profiles: Array<{
    avatar: string;
    name: string;
    wallet: string;
    pitch?: {
      intro: string;
      url?: string;
    };
  }> = [];

  const getUsersPaginated = async (page = 0) => {
    try {
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
        return false;
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
          return {
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
        });

      profiles.push(...results);

      return response.data.directory_items.length > 0;
    } catch (error) {
      // If forum fetch fails, just return what we have
      return false;
    }
  };

  let page = 0;
  let hasMore = true;
  while (hasMore) {
    hasMore = await getUsersPaginated(page);
    page++;
  }

  return profiles;
};
