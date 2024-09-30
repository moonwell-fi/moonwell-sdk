export declare class BaseError extends Error {
    name: string;
    meta: string[];
    constructor(message?: string | undefined);
}
export declare function getBaseError(err: any): BaseError;
export type HttpRequestErrorType = HttpRequestError & {
    name: "HttpRequestError";
};
export declare class HttpRequestError extends BaseError {
    name: string;
    constructor(message?: string | undefined);
}
//# sourceMappingURL=error.d.ts.map