import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing beam token limits", () => {
  test("Should return at least one limit", async () => {
    const result = await testClient.getBeamTokenRoutes();

    const firstRoute = result[0];

    const limits = await testClient.getBeamTokenLimits({
      route: firstRoute,
      direction: "deposit",
    });

    console.log(limits);

    expect(limits.length).toBeGreaterThanOrEqual(1);
  });
});
