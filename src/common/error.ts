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

/** One failed per-chain read inside a multi-chain action. */
export type ChainReadFailure = {
  chainId: number;
  /** The original error from the RPC / contract read, unchanged. */
  reason: unknown;
};

/**
 * Thrown by multi-chain read actions (`getUserPositions`,
 * `getMorphoMarketUserPositions`, `getMorphoVaultUserPositions`) when the read
 * fails on one or more of the requested chains.
 *
 * `failures` lists every failed chain with its original error and `data`
 * carries the results from the chains that succeeded, so a consumer can keep
 * rendering the healthy chains while flagging the broken one. `errors` (from
 * `AggregateError`) holds the same original errors in `failures` order.
 *
 * These failures are surfaced only through this rejection, not additionally
 * through `onError`: a rejection is the consumer's to report, and reporting it
 * on both paths doubled telemetry under query-library retries.
 */
export class ChainReadError<T = unknown> extends AggregateError {
  override readonly name = "ChainReadError";
  readonly source: string;
  readonly failures: ChainReadFailure[];
  readonly data: T[];

  constructor(params: {
    source: string;
    failures: ChainReadFailure[];
    data: T[];
  }) {
    const chainIds = params.failures
      .map((failure) => failure.chainId)
      .join(", ");
    super(
      params.failures.map((failure) => failure.reason),
      `[moonwell-sdk] ${params.source}: read failed on chainIds ${chainIds}`,
    );
    this.source = params.source;
    this.failures = params.failures;
    this.data = params.data;
  }
}
