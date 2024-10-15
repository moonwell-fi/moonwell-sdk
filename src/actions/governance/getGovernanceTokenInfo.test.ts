import { describe, expect, test } from "vitest";
import { testClient } from "../../../test/client.js";

describe("Testing governance token info", () => {
  test("Get governance token info", async () => {
    const governanceTokenInfo = await testClient.getGovernanceTokenInfo({
      governanceToken: "WELL",
    });
    expect(governanceTokenInfo).toBeDefined();
    expect(governanceTokenInfo?.totalSupply).toBeDefined();
  });
});
