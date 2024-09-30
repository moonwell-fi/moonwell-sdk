import type { Environment, GovernanceToken } from "../../environments/index.js";
import type { UserVotingPowers } from "../types/userVotingPowers.js";
export type GetUserVotingPowersType = UserVotingPowers[];
export declare function getUserVotingPowers(params: {
    environments: Environment[];
    user: `0x${string}`;
    governanceToken: GovernanceToken;
}): Promise<GetUserVotingPowersType | undefined>;
//# sourceMappingURL=getUserVotingPowers.d.ts.map