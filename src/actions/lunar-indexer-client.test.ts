import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { shouldFallback } from "./lunar-indexer-client.js";

function createAxiosError(status?: number): AxiosError {
  const response = status
    ? ({ status, data: {}, headers: {}, statusText: "" } as AxiosResponse)
    : undefined;

  const error = new AxiosError(
    `Request failed${status ? ` with status ${status}` : ""}`,
    status ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_NETWORK,
    undefined,
    undefined,
    response,
  );

  return error;
}

describe("shouldFallback", () => {
  // Fallback cases (should return true)

  it("returns true for network errors (no response)", () => {
    const error = createAxiosError();
    expect(shouldFallback(error)).toBe(true);
  });

  it("returns true for 500 internal server error", () => {
    const error = createAxiosError(500);
    expect(shouldFallback(error)).toBe(true);
  });

  it("returns true for 502 bad gateway", () => {
    const error = createAxiosError(502);
    expect(shouldFallback(error)).toBe(true);
  });

  it("returns true for 503 service unavailable", () => {
    const error = createAxiosError(503);
    expect(shouldFallback(error)).toBe(true);
  });

  it("returns true for 404 not found", () => {
    const error = createAxiosError(404);
    expect(shouldFallback(error)).toBe(true);
  });

  // Fail-fast cases (should return false)

  it("returns false for 400 bad request", () => {
    const error = createAxiosError(400);
    expect(shouldFallback(error)).toBe(false);
  });

  it("returns false for 401 unauthorized", () => {
    const error = createAxiosError(401);
    expect(shouldFallback(error)).toBe(false);
  });

  it("returns false for 403 forbidden", () => {
    const error = createAxiosError(403);
    expect(shouldFallback(error)).toBe(false);
  });

  it("returns false for 422 unprocessable entity", () => {
    const error = createAxiosError(422);
    expect(shouldFallback(error)).toBe(false);
  });

  // Non-axios errors (should fallback)

  it("returns true for generic Error instances", () => {
    expect(shouldFallback(new Error("something broke"))).toBe(true);
  });

  it("returns true for string errors", () => {
    expect(shouldFallback("unexpected error")).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(shouldFallback(undefined)).toBe(true);
  });
});
