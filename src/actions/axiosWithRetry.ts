/**
 * Drop-in axios method wrappers with retry built in.
 *
 * Use these instead of `axios.get` / `axios.post` for outbound HTTP calls in
 * action files. The retry policy lives in `./retry.ts`.
 *
 * Why a wrapper instead of `retry(() => axios.get(...))` at each callsite?
 * TypeScript's control-flow narrowing (e.g. after `if (!env.url) return [];`)
 * doesn't propagate into nested closures, so inline `retry(() => axios.get(env.url))`
 * makes `env.url` `string | undefined` again. Passing the URL as a function
 * argument keeps the narrowing intact.
 */
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

import { retry } from "./retry.js";

// Only forward args the caller actually passed — calling axios.get(url, undefined)
// is observably different from axios.get(url) for tests that assert call arity.

export function getWithRetry<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  if (config !== undefined) {
    return retry(() => axios.get<T>(url, config));
  }
  return retry(() => axios.get<T>(url));
}

export function postWithRetry<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<AxiosResponse<T>> {
  if (config !== undefined) {
    return retry(() => axios.post<T, AxiosResponse<T>, D>(url, data, config));
  }
  if (data !== undefined) {
    return retry(() => axios.post<T, AxiosResponse<T>, D>(url, data));
  }
  return retry(() => axios.post<T, AxiosResponse<T>, D>(url));
}
