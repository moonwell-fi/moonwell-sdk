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

  // MFAM went with the Moonriver sunset (MOO-551). TypeScript narrows
  // `GovernanceToken` to "WELL", but a JS consumer still passing "MFAM" would
  // otherwise receive WELL's supply as a normal success — a compile error for
  // TS consumers turning into silently wrong data for everyone else.
  test("resolves when governanceToken is omitted at runtime", async () => {
    const governanceTokenInfo = await testClient.getGovernanceTokenInfo(
      {} as never,
    );
    expect(governanceTokenInfo?.totalSupply).toBeDefined();
  });

  test("rejects the removed MFAM governance token", async () => {
    await expect(
      testClient.getGovernanceTokenInfo({
        governanceToken: "MFAM",
      } as never),
    ).rejects.toThrow(/MFAM was removed with the Moonriver sunset/);
  });
});
