import { type MultichainReturnType } from "../../common/index.js";
import { type Environment } from "../../environments/index.js";
import type { VoteReceipt } from "../types/voteReceipt.js";
export type GetUserVoteReceiptReturnType = MultichainReturnType<VoteReceipt>;
export declare function getUserVoteReceipt(params: {
    environment: Environment;
    id: number;
    account: `0x${string}`;
}): Promise<GetUserVoteReceiptReturnType | undefined>;
//# sourceMappingURL=getUserVoteReceipt.d.ts.map