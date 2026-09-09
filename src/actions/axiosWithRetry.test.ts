import axios from "axios";
import { afterEach, expect, it, vi } from "vitest";
import { getWithRetry, postWithRetry } from "./axiosWithRetry.js";

afterEach(() => vi.restoreAllMocks());
it("keeps the host application's axios timeout unchanged on SDK import", async () => {
  const before = axios.defaults.timeout;
  await import("../index.js");
  expect(axios.defaults.timeout).toBe(before);
});
it("adds deadlines locally and preserves explicit overrides", async () => {
  const get = vi.spyOn(axios, "get").mockResolvedValue({ data: {} });
  const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {} });
  await getWithRetry("/default");
  expect(get).toHaveBeenLastCalledWith("/default", { timeout: 5000 });
  const controller = new AbortController();
  await getWithRetry("/custom", { timeout: 12000, signal: controller.signal });
  expect(get).toHaveBeenLastCalledWith("/custom", {
    timeout: 12000,
    signal: controller.signal,
  });
  await postWithRetry("/post", { query: "data" });
  expect(post).toHaveBeenLastCalledWith(
    "/post",
    { query: "data" },
    { timeout: 5000 },
  );
});
