import { describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";

const mocks = vi.hoisted(() => {
  const getQuote = vi.fn();
  return { getQuote, loadCommon: vi.fn(() => ({ getQuote })) };
});

// `common.js` pulls in @biconomy/abstractjs and @across-protocol/app-sdk. The
// factory runs when the module is first imported, so it records whether that
// happened at load time or only once a quote was requested.
vi.mock("./common.js", () => mocks.loadCommon());

describe("getBeamQuote", () => {
  test("does not load the Biconomy/Across module until a quote is requested", async () => {
    const { getBeamQuote } = await import("./getBeamQuote.js");
    expect(mocks.loadCommon).not.toHaveBeenCalled();

    const quote = { instructions: [] };
    mocks.getQuote.mockResolvedValueOnce(quote);
    const client = {} as MoonwellClient;
    const args = { type: "supply" } as unknown as Parameters<
      typeof getBeamQuote
    >[1];

    await expect(getBeamQuote(client, args)).resolves.toBe(quote);
    expect(mocks.loadCommon).toHaveBeenCalledTimes(1);
    expect(mocks.getQuote).toHaveBeenCalledWith(client, args);
  });
});
