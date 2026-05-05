import type { Address } from "viem";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { testClient } from "../../../test/client.js";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import type { Environment } from "../../environments/index.js";
import { getUserVotingPowers } from "./getUserVotingPowers.js";

// ---------------------------------------------------------------------------
// Module mock — replace getBlockNumberAtTimestamp so unit tests never hit RPC.
// ---------------------------------------------------------------------------

vi.mock("../../common/index.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../common/index.js")>();
  return { ...actual, getBlockNumberAtTimestamp: vi.fn() };
});

// Re-imported after the mock so we get the mocked reference.
const { getBlockNumberAtTimestamp } = await import("../../common/index.js");
const mockedHelper = vi.mocked(getBlockNumberAtTimestamp);

// ---------------------------------------------------------------------------
// Integration tests — preserved from before this PR.
// ---------------------------------------------------------------------------

describe("Testing user voting powers", () => {
  // Only iterate environments where the queried governance token is configured —
  // calling getUserVotingPowers({governanceToken: "WELL"}) on a chain without WELL
  // governance correctly returns [], which would fail the `length > 0` assertion.
  Object.entries(testClient.environments)
    .filter(([, environment]) => {
      const custom = environment.custom as
        | { governance?: { token?: string } }
        | undefined;
      return custom?.governance?.token === "WELL";
    })
    .forEach(([networkKey, environment]) => {
      const { chain } = environment;

      test(`Get user voting powers on ${chain.name}`, async () => {
        const userVotingPowers = await testClient.getUserVotingPowers<
          typeof chain
        >({
          network: networkKey as keyof typeof testClient.environments,
          userAddress: "0x0000000000000000000000000000000000000000",
          governanceToken: "WELL",
        });
        expect(userVotingPowers).toBeDefined();
        expect(userVotingPowers.length).toBeGreaterThan(0);
      });
      test(`Get user voting powers by chain id on ${chain.name}`, async () => {
        const userVotingPowers = await testClient.getUserVotingPowers({
          chainId: chain.id,
          userAddress: "0x0000000000000000000000000000000000000000",
          governanceToken: "WELL",
        });
        expect(userVotingPowers).toBeDefined();
        expect(userVotingPowers.length).toBeGreaterThan(0);
      });
    });
});

// ---------------------------------------------------------------------------
// Unit tests — snapshotTimestamp behaviour with mocked dependencies.
// ---------------------------------------------------------------------------

const USER: Address = "0x0d6065710fF6C1399ebb94e8Da452b0Abf258AD3";

const ZERO_VOTES = {
  delegates: "0x0000000000000000000000000000000000000000" as Address,
  votingPower: 0n,
  delegatedVotingPower: 0n,
};
const ZERO_USER_VOTES = {
  claimsVotes: ZERO_VOTES,
  tokenVotes: ZERO_VOTES,
  stakingVotes: ZERO_VOTES,
};

/**
 * Build a minimal fake client with two `WELL`-token environments so we can assert
 * how `getUserVotingPowers` distributes per-chain block numbers across them.
 */
function makeFakeClient(): {
  client: MoonwellClient;
  reads: { chainA: ReturnType<typeof vi.fn>; chainB: ReturnType<typeof vi.fn> };
} {
  const reads = {
    chainA: vi.fn(async () => ZERO_USER_VOTES),
    chainB: vi.fn(async () => ZERO_USER_VOTES),
  };

  const buildEnv = (
    chainId: number,
    read: ReturnType<typeof vi.fn>,
  ): Environment =>
    ({
      chainId,
      custom: { governance: { token: "WELL" } },
      contracts: {
        views: {
          read: { getUserVotingPower: read },
        },
      },
    }) as unknown as Environment;

  const client = {
    environments: {
      chainA: buildEnv(8453, reads.chainA),
      chainB: buildEnv(10, reads.chainB),
    },
  } as unknown as MoonwellClient;

  return { client, reads };
}

describe("getUserVotingPowers — snapshotTimestamp", () => {
  beforeEach(() => {
    mockedHelper.mockReset();
  });

  test("resolves a per-chain block number and forwards it to the contract read", async () => {
    const { client, reads } = makeFakeClient();
    // Each chain resolves to a different block number for the same timestamp.
    mockedHelper
      .mockResolvedValueOnce(123_456n) // chainA (8453)
      .mockResolvedValueOnce(987_654_321n); // chainB (10)

    await getUserVotingPowers(client, {
      governanceToken: "WELL",
      userAddress: USER,
      snapshotTimestamp: 1_700_000_000,
    });

    expect(mockedHelper).toHaveBeenCalledTimes(2);
    // Every helper invocation receives the same target timestamp …
    expect(mockedHelper.mock.calls[0]?.[1]).toBe(1_700_000_000n);
    expect(mockedHelper.mock.calls[1]?.[1]).toBe(1_700_000_000n);

    // … but each chain's contract read receives ITS OWN resolved block.
    expect(reads.chainA).toHaveBeenCalledWith([USER], {
      blockNumber: 123_456n,
    });
    expect(reads.chainB).toHaveBeenCalledWith([USER], {
      blockNumber: 987_654_321n,
    });
  });

  test("snapshotTimestamp takes precedence over blockNumber when both are supplied", async () => {
    const { client, reads } = makeFakeClient();
    mockedHelper.mockResolvedValueOnce(111n).mockResolvedValueOnce(222n);

    await getUserVotingPowers(client, {
      governanceToken: "WELL",
      userAddress: USER,
      blockNumber: 999_999n,
      snapshotTimestamp: 1_800_000_000,
    });

    expect(reads.chainA).toHaveBeenCalledWith([USER], { blockNumber: 111n });
    expect(reads.chainB).toHaveBeenCalledWith([USER], { blockNumber: 222n });
    // The legacy blockNumber must not leak through.
    expect(reads.chainA).not.toHaveBeenCalledWith([USER], {
      blockNumber: 999_999n,
    });
  });

  test("legacy blockNumber path applies the same block to every chain", async () => {
    const { client, reads } = makeFakeClient();

    await getUserVotingPowers(client, {
      governanceToken: "WELL",
      userAddress: USER,
      blockNumber: 42n,
    });

    // Helper must not be called when only blockNumber is supplied.
    expect(mockedHelper).not.toHaveBeenCalled();
    expect(reads.chainA).toHaveBeenCalledWith([USER], { blockNumber: 42n });
    expect(reads.chainB).toHaveBeenCalledWith([USER], { blockNumber: 42n });
  });
});
