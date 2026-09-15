import type { Environment } from "../environments/index.js";
import { ChainReadError } from "./error.js";

/**
 * Run a per-environment read on every environment and flatten the results.
 *
 * Unlike a bare `Promise.allSettled` that keeps only fulfilled entries, a
 * rejected environment is never dropped silently: if any environment fails,
 * the call rejects with a `ChainReadError` that lists every failed chain with
 * its original error and carries the results of the chains that succeeded.
 * For user positions a silently missing chain is indistinguishable from "no
 * position", which drives wrong balances and borrow limits downstream; the
 * partial `data` on the error lets a consumer keep rendering the healthy
 * chains while flagging the broken one.
 *
 * Failures are surfaced only through the rejection, not additionally through
 * `environment.onError`, so a consumer that retries the call is not told about
 * the same outage once per attempt per chain.
 */
export async function readAcrossEnvironments<T>(params: {
  environments: Environment[];
  source: string;
  read: (environment: Environment) => Promise<T[]>;
}): Promise<T[]> {
  const { environments, source, read } = params;

  const settled = await Promise.allSettled(
    environments.map((environment) => read(environment)),
  );

  const data = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const failures = settled.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ chainId: environments[index].chainId, reason: result.reason }]
      : [],
  );

  if (failures.length > 0) {
    throw new ChainReadError({ source, failures, data });
  }

  return data;
}
