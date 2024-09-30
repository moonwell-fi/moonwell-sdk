"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscussions = void 0;
const axios_1 = require("axios");
const lodash_1 = require("lodash");
const index_js_1 = require("../../common/index.js");
async function getDiscussions() {
    const moonwellProposalsResult = await axios_1.default.get("https://forum.moonwell.fi/c/proposals/moonwell-improvement-proposals/9/l/latest.json");
    if (moonwellProposalsResult.status !== 200 || !moonwellProposalsResult.data) {
        throw new index_js_1.HttpRequestError(moonwellProposalsResult.statusText);
    }
    const communityProposalsResult = await axios_1.default.get("https://forum.moonwell.fi/c/proposals/community-proposal/19/l/latest.json");
    if (communityProposalsResult.status !== 200 ||
        !communityProposalsResult.data) {
        throw new index_js_1.HttpRequestError(communityProposalsResult.statusText);
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
    return (0, lodash_1.uniqWith)(topics, lodash_1.isEqual).sort((a, b) => b.createdAt - a.createdAt);
}
exports.getDiscussions = getDiscussions;
//# sourceMappingURL=getDiscussions.js.map