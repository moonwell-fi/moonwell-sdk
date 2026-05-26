/**
 * Cross-browser AbortSignal.timeout polyfill.
 *
 * `AbortSignal.timeout` was introduced in Chrome 103, Firefox 100, and Safari 15.4.
 * Older browsers — notably Chrome Mobile 98 / Android 7.0 — that some Moonwell users
 * still run do not support it, which surfaces as:
 *
 *   TypeError: AbortSignal.timeout is not a function
 *
 * when the Morpho vault fetch utilities try to set a request timeout.
 *
 * This module exposes `timeoutSignal(ms)` — a drop-in replacement that delegates
 * to the native API when available and falls back to AbortController + setTimeout.
 *
 * Fixes Sentry issue MOONWELL-FRONTEND-RQ.
 */

/**
 * Returns an AbortSignal that fires after `ms` milliseconds.
 *
 * Uses the native `AbortSignal.timeout` where available (Chrome 103+, Firefox 100+,
 * Safari 15.4+) and falls back to `AbortController + setTimeout` for older browsers.
 */
export function timeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("TimeoutError", "TimeoutError")),
    ms,
  );
  // Avoid a dangling timer if the request resolves before the timeout fires.
  controller.signal.addEventListener("abort", () => clearTimeout(timer), {
    once: true,
  });
  return controller.signal;
}
