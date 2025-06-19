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
