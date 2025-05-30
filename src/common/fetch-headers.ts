// Try to get the version from package.json, fallback to '1.0.0'
let sdkVersion = "1.0.0";
try {
  // @ts-ignore
  sdkVersion =
    (await import("../../package.json", { assert: { type: "json" } })).default
      .version || "1.0.0";
} catch (e) {
  // fallback to default
}

export const MOONWELL_FETCH_JSON_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": `moonwell-sdk/${sdkVersion}`,
};
