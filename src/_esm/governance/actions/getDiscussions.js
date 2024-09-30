import axios from "axios";
import { isEqual, uniqWith } from "lodash";
import { HttpRequestError } from "../../common/index.js";
/**
 * Returns a list of discussions from the Moonwell Governance Forum
 *
 * Community Proposals
 * https://forum.moonwell.fi/c/proposals/community-proposal/19
 *
 * Moonwell Improvement Proposals
 * https://forum.moonwell.fi/c/proposals/moonwell-improvement-proposals/20
 */
export async function getDiscussions() {
    const moonwellProposalsResult = await axios.get("https://forum.moonwell.fi/c/proposals/moonwell-improvement-proposals/9/l/latest.json");
    if (moonwellProposalsResult.status !== 200 || !moonwellProposalsResult.data) {
        throw new HttpRequestError(moonwellProposalsResult.statusText);
    }
    const communityProposalsResult = await axios.get("https://forum.moonwell.fi/c/proposals/community-proposal/19/l/latest.json");
    if (communityProposalsResult.status !== 200 ||
        !communityProposalsResult.data) {
        throw new HttpRequestError(communityProposalsResult.statusText);
    }
    const toType = (item) => {
        return item.topic_list.topics.map((topic) => {
            const result = {
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
    const topics = [
        ...toType(moonwellProposalsResult.data),
        ...toType(communityProposalsResult.data),
    ];
    return uniqWith(topics, isEqual).sort((a, b) => b.createdAt - a.createdAt);
}
//# sourceMappingURL=getDiscussions.js.map