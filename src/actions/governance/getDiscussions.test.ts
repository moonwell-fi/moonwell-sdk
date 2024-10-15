import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing discussions", () => {
  test("Get discussions", async () => {
    const discussionData = await testClient.getDiscussions();
    expect(discussionData).toBeDefined();
    expect(discussionData.length).toBeGreaterThan(0);
  });
});
