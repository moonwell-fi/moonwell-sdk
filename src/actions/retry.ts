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
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_INITIAL_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 5_000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return error.response.status >= 500;
}

/**
 * Attach a retry-on-failure interceptor to an axios instance. Every request
 * made through this instance is retried up to `maxAttempts` times when the
 * failure is retriable. Per-config state is tracked on a WeakMap so we don't
 * pollute the public axios config shape.
 */
export function attachRetryInterceptor(
  instance: AxiosInstance,
  options: RetryOptions = {},
): void {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    initialDelay = DEFAULT_INITIAL_DELAY_MS,
    maxDelay = DEFAULT_MAX_DELAY_MS,
  } = options;
  const attemptsByConfig = new WeakMap<InternalAxiosRequestConfig, number>();

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config;
      if (!config) throw error;
      if (!isRetriableError(error)) throw error;

      const previousAttempts = attemptsByConfig.get(config) ?? 0;
      if (previousAttempts >= maxAttempts - 1) throw error;

      attemptsByConfig.set(config, previousAttempts + 1);
      await sleep(backoffDelay(previousAttempts, initialDelay, maxDelay));
      return instance.request(config);
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
  } = options;
  let attempt = 0;
  let lastError: unknown;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      if (!isRetriableError(error)) throw error;
      if (attempt >= maxAttempts) break;
      await sleep(backoffDelay(attempt - 1, initialDelay, maxDelay));
    }
  }
  throw lastError;
}
