/**
 * Retry helpers for SDK API calls.
 *
 * Two consumers:
 *  1. `attachRetryInterceptor` — axios response interceptor used inside
 *     LunarIndexerClient. One install per axios instance covers every method.
 *  2. `retry` — generic wrapper for ad-hoc `axios.post(...)` callsites in
 *     actions that don't go through a shared axios instance.
 *
 * Policy:
 *  - 3 attempts (initial + 2 retries) by default
 *  - Exponential backoff: 250ms → 500ms (capped at 5s)
 *  - Retry only network errors / timeouts / 5xx; never retry 4xx (incl. 404 —
 *    retrying a deterministic "not found" wastes time and amplifies log noise)
 *  - After retries exhaust, the last error propagates to the caller's try/catch
 *    where the existing `environment.onError(...)` wiring picks it up
 */
import axios, {
  type AxiosInstance,
  type GenericAbortSignal,
  type InternalAxiosRequestConfig,
} from "axios";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  signal?: GenericAbortSignal | undefined;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_INITIAL_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 5_000;

async function sleep(ms: number, signal?: GenericAbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new axios.CanceledError());
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", onAbort);
      reject(new axios.CanceledError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener?.("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener?.("abort", onAbort, { once: true });
  });
}

function backoffDelay(
  attemptIndex: number,
  initialDelay: number,
  maxDelay: number,
): number {
  return Math.min(initialDelay * 2 ** attemptIndex, maxDelay);
}

/**
 * Decide whether an error represents a transient failure worth retrying.
 * - Axios network errors (no `response`) → retry (server unreachable, timeout)
 * - 5xx responses → retry (server hiccup)
 * - 4xx responses (incl. 404) → do NOT retry (deterministic, won't change)
 * - Non-axios errors (parse errors, code bugs) → do NOT retry
 */
export function isRetriableError(error: unknown): boolean {
  if (axios.isCancel(error)) return false;
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return error.response.status >= 500;
}

/**
 * Attach a retry-on-failure interceptor to an axios instance. Every request
 * made through this instance is retried up to `maxAttempts` times when the
 * failure is retriable. Axios merges into a new config on every request, so
 * the attempt counter must travel with that config rather than its identity.
 */
export function attachRetryInterceptor(
  instance: AxiosInstance,
  options: Omit<RetryOptions, "signal"> = {},
): void {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    initialDelay = DEFAULT_INITIAL_DELAY_MS,
    maxDelay = DEFAULT_MAX_DELAY_MS,
  } = options;
  interface RetryConfig extends InternalAxiosRequestConfig {
    moonwellRetryAttempts?: number | undefined;
  }

  instance.interceptors.response.use(
    (response) => {
      const config: RetryConfig = response.config;
      config.moonwellRetryAttempts = undefined;
      return response;
    },
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;
      const config: RetryConfig | undefined = error.config;
      if (!config) throw error;
      const previousAttempts = config.moonwellRetryAttempts ?? 0;
      if (!isRetriableError(error) || previousAttempts >= maxAttempts - 1) {
        config.moonwellRetryAttempts = undefined;
        throw error;
      }

      config.moonwellRetryAttempts = previousAttempts + 1;
      try {
        await sleep(
          backoffDelay(previousAttempts, initialDelay, maxDelay),
          config.signal,
        );
        return await instance.request(config);
      } catch (retryError) {
        config.moonwellRetryAttempts = undefined;
        throw retryError;
      }
    },
  );
}

/**
 * Generic wrapper for individual axios calls (e.g. raw `axios.post(...)` in
 * action files that don't share a configured instance). Mirrors the
 * interceptor's policy: retry transient failures, fail fast on 4xx.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    initialDelay = DEFAULT_INITIAL_DELAY_MS,
    maxDelay = DEFAULT_MAX_DELAY_MS,
    signal,
  } = options;
  let attempt = 0;
  let lastError: unknown;
  while (attempt < maxAttempts) {
    if (signal?.aborted) throw new axios.CanceledError();
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      if (!isRetriableError(error)) throw error;
      if (attempt >= maxAttempts) break;
      await sleep(backoffDelay(attempt - 1, initialDelay, maxDelay), signal);
    }
  }
  throw lastError;
}
