import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing delegates", () => {
  test("Get delegates", async () => {
    const delegates = await testClient.getDelegates();
    expect(delegates).toBeDefined();
    expect(delegates.length).toBeGreaterThan(0);
    // Regression guard for PR #284: with the full Eth views wired and
    // `mainnet.id` added to `targetChainIds`, at least one delegate must
    // carry a voting-power entry keyed by chainId 1.
    expect(
      delegates.some((d) => d.votingPower !== undefined && 1 in d.votingPower),
    ).toBe(true);
  });
});
