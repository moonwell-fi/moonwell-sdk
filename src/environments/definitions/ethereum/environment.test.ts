import { describe, expect, test } from "vitest";
import { custom } from "./custom.js";
import { createEnvironment, ethereum } from "./environment.js";
import { tokens } from "./tokens.js";

// Locks the four invariants the WELL-to-Ethereum bridge relies on so silent
// regressions (e.g. someone bumping viem and `testnet` flipping back to
// `undefined`) get caught at unit-test time rather than in the frontend.
describe("ethereum environment invariants", () => {
  test("chain.testnet is strictly false", () => {
    expect(ethereum.testnet).toBe(false);

    const env = createEnvironment();
    expect(env.chain.testnet).toBe(false);
  });

  test("governance token is WELL", () => {
    expect(custom.governance.token).toBe("WELL");
  });

  test("wormhole chainId is 2 (Ethereum mainnet)", () => {
    expect(custom.wormhole.chainId).toBe(2);
  });

  test("WELL token address matches the canonical xWELL OFT", () => {
    expect(tokens.WELL.address).toBe(
      "0xA88594D404727625A9437C3f886C7643872296AE",
    );
  });

  test("xWELL bridge adapter matches MIP-X55", () => {
    expect(custom.xWELL.bridgeAdapter.address).toBe(
      "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7",
    );
  });
});
