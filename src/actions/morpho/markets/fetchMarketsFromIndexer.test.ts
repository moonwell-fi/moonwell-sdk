import { beforeEach, describe, expect, test, vi } from "vitest";
import { getWithRetry } from "../../axiosWithRetry.js";
import { fetchMarketsFromIndexer } from "./lunarIndexerTransform.js";

vi.mock("../../axiosWithRetry.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../axiosWithRetry.js")>();
  return { ...actual, getWithRetry: vi.fn() };
});

const LUNAR_URL = "https://mock-lunar.test";

// PR #339 review: `response.results` went straight into `.filter` / iteration
// in getMorphoMarketsDataFromIndexer, so a 2xx body without the array surfaced
// as a TypeError through that catch's onError ("morpho-markets"). Guarded at
// the fetcher so every consumer gets the named error.
describe("fetchMarketsFromIndexer — response shape", () => {
  beforeEach(() => {
    vi.mocked(getWithRetry).mockReset();
  });

  test("returns the body when results is an array", async () => {
    vi.mocked(getWithRetry).mockResolvedValue({
      data: { results: [] },
    } as never);

    await expect(fetchMarketsFromIndexer(LUNAR_URL, 8453)).resolves.toEqual({
      results: [],
    });
  });

  test("throws a diagnosable error when the body has no results array", async () => {
    vi.mocked(getWithRetry).mockResolvedValue({ data: {} } as never);

    await expect(fetchMarketsFromIndexer(LUNAR_URL, 8453)).rejects.toThrow(
      "Lunar Indexer morpho markets response for chain 8453 is missing the results array",
    );
  });
});
