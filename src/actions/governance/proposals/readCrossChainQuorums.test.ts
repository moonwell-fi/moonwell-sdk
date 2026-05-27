import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../../environments/index.js";
import type { ApiProposal } from "../governor-api-client.js";

// Production module-level `publicEnvironments` is replaced with a controllable
// fixture so tests never touch real RPC.
const ethQuorum = vi.fn(async () => 1234n);
const moonbeamQuorum = vi.fn(async () => 500n);

vi.mock("../../../environments/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../environments/index.js")>();
  return {
    ...actual,
    publicEnvironments: {
      ethereum: {
        chainId: 1,
        contracts: {
          multichainGovernor: { read: { quorum: ethQuorum } },
        },
      },
      moonbeam: {
        chainId: 1284,
        contracts: {
          multichainGovernor: { read: { quorum: moonbeamQuorum } },
        },
      },
      base: {
        // No multichainGovernor wired — should be omitted from the map.
        chainId: 8453,
        contracts: {},
      },
    },
  };
});

const { readCrossChainQuorums } = await import("./common.js");

const proposal = (chainId: number, proposalId: number): ApiProposal =>
  ({ chainId, proposalId, description: "" }) as unknown as ApiProposal;

const makeEnv = (chainId: number, onError = vi.fn()): Environment =>
  ({ chainId, onError }) as unknown as Environment;

describe("readCrossChainQuorums", () => {
  beforeEach(() => {
    ethQuorum.mockReset().mockResolvedValue(1234n);
    moonbeamQuorum.mockReset().mockResolvedValue(500n);
  });

  test("returns an empty map for an empty proposal list", async () => {
    const out = await readCrossChainQuorums([], makeEnv(1284));
    expect(out.size).toBe(0);
    expect(ethQuorum).not.toHaveBeenCalled();
  });

  test("returns an empty map when every proposal is on the governance env's own chain", async () => {
    const out = await readCrossChainQuorums(
      [proposal(1284, 1), proposal(1284, 2)],
      makeEnv(1284),
    );
    expect(out.size).toBe(0);
    expect(ethQuorum).not.toHaveBeenCalled();
  });

  test("dedupes multiple proposals on the same foreign chain into one read", async () => {
    const out = await readCrossChainQuorums(
      [proposal(1, 1), proposal(1, 2), proposal(1, 3)],
      makeEnv(1284),
    );
    expect(ethQuorum).toHaveBeenCalledTimes(1);
    expect(out.get(1)).toBe(1234n);
  });

  test("omits foreign chains whose env has no multichainGovernor wired", async () => {
    const out = await readCrossChainQuorums(
      [proposal(8453, 1), proposal(1, 2)],
      makeEnv(1284),
    );
    expect(out.has(8453)).toBe(false);
    expect(out.get(1)).toBe(1234n);
  });

  test("omits foreign chains absent from publicEnvironments entirely", async () => {
    const out = await readCrossChainQuorums(
      [proposal(99_999, 1), proposal(1, 2)],
      makeEnv(1284),
    );
    expect(out.has(99_999)).toBe(false);
    expect(out.get(1)).toBe(1234n);
  });

  test("on quorum() revert: omits the chain, console.warns, and calls env.onError", async () => {
    const revert = new Error("execution reverted");
    ethQuorum.mockRejectedValueOnce(revert);
    const onError = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const out = await readCrossChainQuorums(
      [proposal(1, 1)],
      makeEnv(1284, onError),
    );

    expect(out.has(1)).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(revert, {
      source: "governance-cross-chain-quorum",
      chainId: 1,
    });

    warnSpy.mockRestore();
  });
});
