import type { Environment } from "../environments/index.js";

/**
 * Run a per-environment read on every environment and flatten the results.
 *
 * Unlike a bare `Promise.allSettled` that keeps only fulfilled entries, a
 * rejected environment is never dropped silently: every failure is reported
 * through `environment.onError` (with `source` and `chainId`) and the call
 * then rejects. Callers keep their last good data instead of receiving a
 * list that is missing a chain — for user positions, a missing entry is
 * indistinguishable from "no position", which drives wrong balances and
 * borrow limits downstream.
 *
 * When exactly one environment fails, its original error is rethrown so the
 * consumer keeps the full RPC/contract error. When several fail, they are
 * wrapped in an `AggregateError`.
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

  const failures: { chainId: number; reason: unknown }[] = [];
  const results: T[] = [];

  settled.forEach((result, index) => {
    const environment = environments[index];
    if (result.status === "fulfilled") {
      results.push(...result.value);
      return;
    }
    failures.push({ chainId: environment.chainId, reason: result.reason });
    environment.onError?.(result.reason, {
      source,
      chainId: environment.chainId,
    });
  });

  if (failures.length === 1) {
    throw failures[0].reason;
  }
  if (failures.length > 1) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      `[moonwell-sdk] ${source}: read failed on chainIds ${failures
        .map((failure) => failure.chainId)
        .join(", ")}`,
    );
  }

  return results;
}
