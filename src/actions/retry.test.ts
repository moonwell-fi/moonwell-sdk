import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachRetryInterceptor, retry } from "./retry.js";

function unavailable(
  config: InternalAxiosRequestConfig,
  status = 503,
): AxiosError {
  return new AxiosError("unavailable", "ERR_BAD_RESPONSE", config, undefined, {
    config,
    status,
    statusText: "Unavailable",
    headers: {},
    data: {},
  });
}
function success(config: InternalAxiosRequestConfig) {
  return { config, status: 200, statusText: "OK", headers: {}, data: "ok" };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Axios interceptor retries with real config merging", () => {
  it.each([new Error("adapter bug"), new AxiosError("missing request config")])(
    "propagates failures that cannot be replayed",
    async (error) => {
      const adapter = vi.fn().mockRejectedValue(error);
      const instance = axios.create({ adapter });
      attachRetryInterceptor(instance);
      await expect(instance.get("/markets")).rejects.toBe(error);
      expect(adapter).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("stops after three attempts, including 250ms/500ms backoff", async () => {
    const configs: InternalAxiosRequestConfig[] = [];
    const times: number[] = [];
    const start = Date.now();
    const adapter: AxiosAdapter = async (config) => {
      configs.push(config);
      times.push(Date.now() - start);
      // Bound the regression itself: the old WeakMap implementation reaches eight.
      if (configs.length >= 8) throw new Error("retry loop escaped its budget");
      throw unavailable(config);
    };
    const instance = axios.create({ adapter });
    attachRetryInterceptor(instance);
    const request = instance.get("/markets").catch((error) => error);
    await vi.runAllTimersAsync();
    expect(await request).toMatchObject({ message: "unavailable" });
    expect(times).toEqual([0, 250, 750]);
    expect(new Set(configs).size).toBe(3);
  });

  it("keeps concurrent requests independent and resets the counter after success", async () => {
    const counts = new Map<string, number>();
    const instance = axios.create({
      adapter: async (config) => {
        const key = config.url ?? "";
        const count = (counts.get(key) ?? 0) + 1;
        counts.set(key, count);
        if (count < 3) throw unavailable(config);
        return success(config);
      },
    });
    attachRetryInterceptor(instance);
    const requests = Promise.all([
      instance.get("/base"),
      instance.get("/optimism"),
    ]);
    await vi.runAllTimersAsync();
    const responses = await requests;
    expect([...counts.values()]).toEqual([3, 3]);
    for (const response of responses)
      expect(response.config).toHaveProperty(
        "moonwellRetryAttempts",
        undefined,
      );
    counts.clear();
    const firstResponse = responses[0];
    if (!firstResponse) throw new Error("Expected a response");
    const repeated = instance.request(firstResponse.config);
    await vi.runAllTimersAsync();
    expect((await repeated).data).toBe("ok");
    expect(counts.get("/base")).toBe(3);
  });

  it.each([400, 401, 404, 429])("does not retry HTTP %i", async (status) => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unavailable(config, status);
    });
    const instance = axios.create({ adapter });
    attachRetryInterceptor(instance);
    const request = instance.get("/markets").catch((error) => error);
    await vi.runAllTimersAsync();
    expect((await request).response.status).toBe(status);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it("honors a one-attempt budget", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unavailable(config);
    });
    const instance = axios.create({ adapter });
    attachRetryInterceptor(instance, { maxAttempts: 1 });
    const request = instance.get("/markets").catch((error) => error);
    await vi.runAllTimersAsync();
    expect(await request).toBeInstanceOf(AxiosError);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it("stops retrying when aborted during backoff", async () => {
    const controller = new AbortController();
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unavailable(config);
    });
    const instance = axios.create({ adapter });
    attachRetryInterceptor(instance);
    const request = instance
      .get("/markets", { signal: controller.signal })
      .catch((error) => error);
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await vi.runAllTimersAsync();
    expect(axios.isCancel(await request)).toBe(true);
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never retries a canceled request", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw new axios.CanceledError("canceled", config);
    });
    const instance = axios.create({ adapter });
    attachRetryInterceptor(instance);
    const request = instance.get("/markets").catch((error) => error);
    await vi.runAllTimersAsync();
    expect(axios.isCancel(await request)).toBe(true);
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});

describe("ad-hoc retry", () => {
  it.each(["ECONNABORTED", "ERR_NETWORK"])(
    "bounds %s failures",
    async (code) => {
      const error = new AxiosError("network failed", code);
      const fn = vi.fn().mockRejectedValue(error);
      const request = retry(fn).catch((error) => error);
      await vi.runAllTimersAsync();
      expect(await request).toBe(error);
      expect(fn).toHaveBeenCalledTimes(3);
    },
  );
  it("does not start an aborted request", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn();
    const result = await retry(fn, { signal: controller.signal }).catch(
      (error) => error,
    );
    expect(axios.isCancel(result)).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
  it("aborts during backoff without waiting for the next attempt", async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockRejectedValue(new AxiosError("down", "ERR_NETWORK"));
    const request = retry(fn, { signal: controller.signal }).catch(
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(50);
    controller.abort();
    expect(axios.isCancel(await request)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([new Error("decode failed"), new axios.CanceledError()])(
    "does not retry non-transient failures",
    async (error) => {
      const fn = vi.fn().mockRejectedValue(error);
      expect(await retry(fn).catch((error) => error)).toBe(error);
      expect(fn).toHaveBeenCalledTimes(1);
    },
  );
});
