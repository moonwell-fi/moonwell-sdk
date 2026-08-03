import { describe, expect, test } from "vitest";
import { testClient } from "../../../../test/client.js";
import { base } from "../../../environments/index.js";

describe("Testing markets", () => {
  // Was a Moonbeam xcDOT bad-debt check, plus commented-out FRAX/GLMR variants,
  // until the sunset removed that chain (MOO-551). Re-pointed at Base so the
  // single-market read path stays covered against a chain that still answers.
  test("Test USDC market resolves", async () => {
    const usdcMarket = await testClient.getMarket({
      chainId: base.id,
      marketAddress: testClient.environments.base.markets.MOONWELL_USDC.address,
    });
    expect(usdcMarket).toBeDefined();
  });
});
