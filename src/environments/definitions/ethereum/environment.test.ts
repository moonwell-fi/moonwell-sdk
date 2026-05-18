import { describe, expect, test } from "vitest";
import { createEnvironment, ethereum } from "./environment.js";

// Locks the invariants the WELL-to-Ethereum bridge relies on so silent
// regressions (e.g. someone bumping viem and `testnet` flipping back to
// `undefined`, or `custom: custom` being reset to `custom: {}` in
// environment.ts) get caught at unit-test time rather than in the frontend.
describe("ethereum environment invariants", () => {
  test("chain.testnet is strictly false", () => {
    expect(ethereum.testnet).toBe(false);

    const env = createEnvironment();
    expect(env.chain.testnet).toBe(false);
  });

  test("custom config flows through createEnvironment", () => {
    const env = createEnvironment();

    expect(env.custom.governance.token).toBe("WELL");
    expect(env.custom.wormhole.chainId).toBe(2);
    expect(env.custom.wormhole.tokenBridge.address).toBe(
      "0x3ee18B2214AFF97000D974cf647E654bB5f1d8A8",
    );
    expect(env.custom.xWELL.bridgeAdapter.address).toBe(
      "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7",
    );
  });

  test("WELL token address matches the canonical xWELL OFT", () => {
    const env = createEnvironment();

    expect(env.config.tokens.WELL.address).toBe(
      "0xA88594D404727625A9437C3f886C7643872296AE",
    );
  });
});
