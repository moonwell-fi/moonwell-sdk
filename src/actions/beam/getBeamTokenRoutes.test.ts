import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing beam token routes", () => {
  test("Should return at least one route", async () => {
    const result = await testClient.getBeamTokenRoutes();

    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
