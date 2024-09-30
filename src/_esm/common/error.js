export class BaseError extends Error {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "BaseError"
        });
        Object.defineProperty(this, "meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}
export function getBaseError(err) {
    if (err instanceof BaseError)
        return err;
    if (err instanceof Error)
        return new BaseError(err.message);
    if (typeof err?.message === "string")
        return new BaseError(err.message);
    if (typeof err === "string")
        return new BaseError(err);
    return new BaseError("unknown error");
}
export class HttpRequestError extends BaseError {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "HttpRequestError"
        });
        Object.setPrototypeOf(this, HttpRequestError.prototype);
    }
}
//# sourceMappingURL=error.js.map