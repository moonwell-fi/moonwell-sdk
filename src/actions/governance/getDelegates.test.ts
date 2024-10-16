import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing delegates", () => {
  test("Get delegates", async () => {
    const delegates = await testClient.getDelegates();
    expect(delegates).toBeDefined();
    expect(delegates.length).toBeGreaterThan(0);
  });
});
