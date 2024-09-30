import { HttpRequestError } from "../../common/index.js";
import type { Discussion } from "../types/discussion.js";
export type GetDiscussionsReturnType = Discussion[];
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
export declare function getDiscussions(): Promise<GetDiscussionsReturnType>;
//# sourceMappingURL=getDiscussions.d.ts.map