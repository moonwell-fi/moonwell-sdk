/**
 * AbortSignal.timeout() was added in Chrome 103 / Node 17.3 / Firefox 100.
 * Older Android WebViews (Chrome < 103) don't have it, causing a TypeError at
 * call-time that propagates to the caller as an unhandled SDK error.
 * This helper returns a signal that times out after `ms` milliseconds regardless
 * of runtime support.
 */
export function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// Try to get the version from package.json, fallback to '1.0.0'
let sdkVersion = "1.0.0";
try {
  // @ts-ignore
  // Importing package.json synchronously (requires --resolveJsonModule in tsconfig)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sdkVersion = require("../../package.json").version || "1.0.0";
} catch (e) {
  // fallback to default
}

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export const MOONWELL_FETCH_JSON_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(isBrowser ? {} : { "User-Agent": `moonwell-sdk/${sdkVersion}` }),
};
