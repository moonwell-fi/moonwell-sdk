import axios from "axios";
import lodash from "lodash";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { HttpRequestError } from "../../common/index.js";
import * as logger from "../../logger/console.js";
import type { Discussion } from "../../types/discussion.js";

const { isEqual, uniqWith } = lodash;

export type GetDiscussionsReturnType = Promise<Discussion[]>;

export type GetDiscussionsErrorType = HttpRequestError;

/**
 * Returns a list of discussions from the Moonwell Governance Forum
 *
 * Community Proposals
 * https://forum.moonwell.fi/c/proposals/community-proposal/19
 *
 * Moonwell Improvement Proposals
 * https://forum.moonwell.fi/c/proposals/moonwell-improvement-proposals/20
 */
export async function getDiscussions(
  _client: MoonwellClient,
): GetDiscussionsReturnType {
  type ForumTopicRequestResponse = {
    topic_list: {
      topics: {
        id: number;
        title: string;
        views: number;
        category_id: number;
        posts_count: number;
        created_at: string;
        featured_link: string;
        tags: string[];
      }[];
    };
  };

  const logId = logger.start(
    "getDiscussions",
    "Starting to get discussions...",
  );

  const moonwellProposalsResult = await axios.get<ForumTopicRequestResponse>(
    "https://forum.moonwell.fi/c/proposals/moonwell-improvement-proposals/9/l/latest.json",
  );

  if (moonwellProposalsResult.status !== 200 || !moonwellProposalsResult.data) {
    throw new HttpRequestError(moonwellProposalsResult.statusText);
  }

  const communityProposalsResult = await axios.get<ForumTopicRequestResponse>(
    "https://forum.moonwell.fi/c/proposals/community-proposal/19/l/latest.json",
  );

  if (
    communityProposalsResult.status !== 200 ||
    !communityProposalsResult.data
  ) {
    throw new HttpRequestError(communityProposalsResult.statusText);
  }

  logger.end(logId);

  const toType = (item: ForumTopicRequestResponse) => {
    return item.topic_list.topics.map((topic) => {
      const result: Discussion = {
        title: topic.title,
        views: topic.views,
        replies: topic.posts_count - 1,
        createdAt: new Date(topic.created_at).getTime(),
        tags: topic.tags,
        link: `https://forum.moonwell.fi/t/${topic.id}`,
      };
      return result;
    });
  };

  const topics: Discussion[] = [
    ...toType(moonwellProposalsResult.data),
    ...toType(communityProposalsResult.data),
  ];

  return uniqWith(topics, isEqual).sort((a, b) => b.createdAt - a.createdAt);
}
