import { HttpRequestError } from "../../common/index.js";
import type { Delegate } from "../types/delegate.js";
export type GetDelegatesErrorType = HttpRequestError;
export type GetDelegatesReturnType = Delegate[];
/**
 * Returns a list of the delegates from the Moonwell Governance Forum
 *
 * https://forum.moonwell.fi/c/delegation-pitch/17
 */
export declare function getDelegates(): Promise<GetDelegatesReturnType>;
//# sourceMappingURL=getDelegates.d.ts.map