export class BaseError extends Error {
  override name = "BaseError";

  meta: string[] = [];

  constructor(message?: string | undefined) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

export function getBaseError(err: any) {
  if (err instanceof BaseError) return err;
  if (err instanceof Error) return new BaseError(err.message);
  if (typeof err?.message === "string") return new BaseError(err.message);
  if (typeof err === "string") return new BaseError(err);
  return new BaseError("unknown error");
}

export type HttpRequestErrorType = HttpRequestError & {
  name: "HttpRequestError";
};
export class HttpRequestError extends BaseError {
  override name = "HttpRequestError";

  constructor(message?: string | undefined) {
    super(message);
    Object.setPrototypeOf(this, HttpRequestError.prototype);
  }
}
