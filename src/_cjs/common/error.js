"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestError = exports.getBaseError = exports.BaseError = void 0;
class BaseError extends Error {
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
exports.BaseError = BaseError;
function getBaseError(err) {
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
exports.getBaseError = getBaseError;
class HttpRequestError extends BaseError {
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
exports.HttpRequestError = HttpRequestError;
//# sourceMappingURL=error.js.map