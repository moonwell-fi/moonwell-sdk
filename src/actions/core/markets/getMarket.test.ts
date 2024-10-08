import { expect, test } from "vitest";
import { baseClient } from "../../../../test/client.js";
import type { base } from "../../../environments/index.js";

test("get market", async () => {
  const moonwellAeroMarket = await baseClient.getMarket<typeof base>({
    market: "MOONWELL_AERO",
    network: "base",
  });
  expect(moonwellAeroMarket).toBeDefined();
});
