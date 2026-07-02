import { afterEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { ProposalState } from "../../../types/proposal.js";
import {
  type ApiProposal,
  GovernorNotFoundError,
  fetchProposal,
} from "../governor-api-client.js";
import { type ProposalOnChainData, getProposalsOnChainData } from "./common.js";
import { getProposal } from "./getProposal.js";

vi.mock("../governor-api-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../governor-api-client.js")>();
  return { ...actual, fetchProposal: vi.fn() };
});

vi.mock("./common.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./common.js")>();
  return { ...actual, getProposalsOnChainData: vi.fn() };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockedFetchProposal = vi.mocked(fetchProposal);
const mockedOnChain = vi.mocked(getProposalsOnChainData);

const ETHEREUM_CHAIN_ID = 1;
const MOONBEAM_CHAIN_ID = 1284;

const moonbeamEnv = {
  key: "moonbeam",
  chainId: MOONBEAM_CHAIN_ID,
  governanceIndexerUrl: "https://mock-indexer.test",
  contracts: {},
  custom: {},
  config: {},
} as unknown as Record<string, unknown>;

const moonriverEnv = {
  key: "moonriver",
  chainId: 1285,
  governanceIndexerUrl: "https://mock-indexer.test",
  contracts: {},
  custom: {},
  config: {},
} as unknown as Record<string, unknown>;

const client = {
  environments: { moonbeam: moonbeamEnv, moonriver: moonriverEnv },
} as unknown as MoonwellClient;

const baseApiProposal: ApiProposal = {
  id: "1-0000000007",
  chainId: ETHEREUM_CHAIN_ID,
  proposalId: 7,
  proposer: "0x0000000000000000000000000000000000000001",
  targets: [],
  values: [],
  calldatas: [],
  votingStartTime: 0,
  votingEndTime: 0,
  description: "# MIP-X01: Test\nbody",
  forVotes: "0",
  againstVotes: "0",
  abstainVotes: "0",
  blockNumber: "1",
  timestamp: 0,
  transactionHash: "0xabc",
};

const defaultOnChain: ProposalOnChainData = {
  state: 0,
  proposalData: null,
  eta: 0,
  votesCollected: false,
  quorum: 0n,
  // getProposalsOnChainData is mocked here, so it no longer derives multichain
  // from the proposal — the mock supplies the canonical flag the fetcher reads.
  isMultichain: false,
};

afterEach(() => {
  vi.clearAllMocks();
});

const WORMHOLE_TARGET = "0xc8e2b0cd52cf01b0ce87d389daa3d414d4ce29f3";
// A plain (non-bridge) contract target — the shape of a hub-local proposal that
// executes only on Ethereum (proposal-171 successor).
const LOCAL_TARGET = "0xed301cd3eb27217bdb05c4e9b820a8a3c8b665f9";

describe("getProposal environment guard", () => {
  test("returns undefined when the requested env doesn't exist in the client", async () => {
    const result = await getProposal(client, {
      network: "polygon", // not in the mock client.environments
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    expect(mockedFetchProposal).not.toHaveBeenCalled();
  });
});

describe("getProposal state post-processing", () => {
  test("promotes Pending → Active when on-chain state is 0 and now is within voting window", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
      votingStartTime: now - 100,
      votingEndTime: now + 100,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.state).toBe(1); // ProposalState.Active
    // Empty-fallback: the API omits `signatures` for multichain proposals
    // (selector is in the calldata), so `apiProposal.signatures ?? []` yields [].
    expect(result?.signatures).toEqual([]);
    // Regression guard against #3: the third argument carrying
    // `crossChainQuorums` must reach getProposalsOnChainData. A wiring
    // regression that drops it would still make assertions on `state` pass.
    expect(mockedOnChain).toHaveBeenCalledWith(
      expect.any(Array),
      expect.anything(),
      expect.objectContaining({ crossChainQuorums: expect.any(Map) }),
    );
  });

  test("EXECUTED state-change forces state=Executed regardless of on-chain state", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
      stateChanges: [
        {
          id: "sc-1",
          proposalId: "1284-0000000007",
          state: "EXECUTED",
          blockNumber: "1",
          timestamp: 1,
          transactionHash: "0xexec",
          forVotes: "0",
          againstVotes: "0",
          abstainVotes: "0",
          chainId: MOONBEAM_CHAIN_ID,
        },
      ],
    });
    mockedOnChain.mockResolvedValueOnce([{ ...defaultOnChain, state: 5 }]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.state).toBe(7); // ProposalState.Executed
    expect(result?.executed).toBe(true);
  });

  test("multichain Succeeded with votesCollected past voting end → promoted to Queued", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
      targets: [WORMHOLE_TARGET],
      votingStartTime: now - 200,
      votingEndTime: now - 100,
    });
    // Succeeded comes from getProposalsOnChainData already normalized to
    // ProposalState space (4). The consumer promotes it to Queued (5) so the
    // frontend timeline shows "Ready to Execute".
    mockedOnChain.mockResolvedValueOnce([
      {
        ...defaultOnChain,
        state: ProposalState.Succeeded,
        votesCollected: true,
        isMultichain: true,
      },
    ]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.state).toBe(ProposalState.Queued);
    expect(result?.multichain).toEqual({
      id: 7,
      votesCollected: true,
    });
  });

  test("hub-local Ethereum proposal (chainId 1, no bridge target) Succeeded+collected → Queued — the next hub proposal", async () => {
    // proposal-171 successor shape: homed on the Ethereum MultichainGovernor
    // with only a local (non-bridge) target. getProposalsOnChainData classifies
    // it multichain via isMultichainHomeChain and reads Succeeded + collected
    // from the hub governor (covered in common.test.ts). This locks the
    // end-to-end fetcher contract the timeline consumes: state promotes to
    // Queued and multichain.votesCollected is true (→ "Votes Collected, Ready
    // to Execute"), while the preserved no-bridge targets keep the frontend on
    // the single-chain Execute step rather than phantom cross-chain steps.
    const now = Math.floor(Date.now() / 1000);
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: ETHEREUM_CHAIN_ID,
      targets: [LOCAL_TARGET],
      votingStartTime: now - 200,
      votingEndTime: now - 100,
    });
    mockedOnChain.mockResolvedValueOnce([
      {
        ...defaultOnChain,
        state: ProposalState.Succeeded,
        votesCollected: true,
        isMultichain: true,
      },
    ]);

    // No explicit chainId — default routing tries chainId 1 first and the
    // mocked fetch returns this Ethereum-homed proposal, short-circuiting.
    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.chainId).toBe(ETHEREUM_CHAIN_ID);
    expect(result?.state).toBe(ProposalState.Queued);
    expect(result?.multichain).toEqual({ id: 7, votesCollected: true });
    // No Wormhole bridge target → the timeline gates cross-chain steps off and
    // renders the single-chain Execute step; the SDK must preserve targets.
    expect(result?.targets).toEqual([LOCAL_TARGET]);
  });

  test.each([
    ["Defeated", ProposalState.Defeated],
    ["Canceled", ProposalState.Canceled],
  ])(
    "multichain %s with votesCollected past voting end stays terminal (not promoted)",
    async (_label, terminalState) => {
      // Regression for the Critical: under the state-machine-based
      // votesCollected, terminal failed states (Canceled/Defeated) also satisfy
      // `votesCollected: true`. The old `< Queued` gate would have wrongly
      // promoted them to Queued; the tightened `=== Succeeded` gate must not.
      const now = Math.floor(Date.now() / 1000);
      mockedFetchProposal.mockResolvedValueOnce({
        ...baseApiProposal,
        chainId: MOONBEAM_CHAIN_ID,
        targets: [WORMHOLE_TARGET],
        votingStartTime: now - 200,
        votingEndTime: now - 100,
      });
      mockedOnChain.mockResolvedValueOnce([
        {
          ...defaultOnChain,
          state: terminalState,
          votesCollected: true,
          isMultichain: true,
        },
      ]);

      const result = await getProposal(client, {
        network: "moonbeam",
        proposalId: 7,
        chainId: MOONBEAM_CHAIN_ID,
      } as unknown as Parameters<typeof getProposal>[1]);

      expect(result?.state).toBe(terminalState);
    },
  );
});

describe("getProposal fallback behavior", () => {
  test("uses chainId=1 first and short-circuits without trying 1284", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: ETHEREUM_CHAIN_ID,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.chainId).toBe(ETHEREUM_CHAIN_ID);
    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
    expect(mockedFetchProposal).toHaveBeenCalledWith(
      moonbeamEnv,
      ETHEREUM_CHAIN_ID,
      7,
    );
  });

  test("falls back to chainId=1284 when chainId=1 returns GovernorNotFoundError", async () => {
    mockedFetchProposal
      .mockRejectedValueOnce(new GovernorNotFoundError(ETHEREUM_CHAIN_ID, 7))
      .mockResolvedValueOnce({
        ...baseApiProposal,
        chainId: MOONBEAM_CHAIN_ID,
      });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.chainId).toBe(MOONBEAM_CHAIN_ID);
    expect(mockedFetchProposal).toHaveBeenCalledTimes(2);
    expect(mockedFetchProposal.mock.calls[1]?.[1]).toBe(MOONBEAM_CHAIN_ID);
  });

  test("returns undefined when the multigov chains (1, 1284) return NotFoundError", async () => {
    mockedFetchProposal
      .mockRejectedValueOnce(new GovernorNotFoundError(ETHEREUM_CHAIN_ID, 7))
      .mockRejectedValueOnce(new GovernorNotFoundError(MOONBEAM_CHAIN_ID, 7));

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    // Only the two multigov chains are tried — Moonriver (1285) is NOT in the
    // fallback, so the loop stops at 1284.
    expect(mockedFetchProposal).toHaveBeenCalledTimes(2);
    expect(mockedOnChain).not.toHaveBeenCalled();
  });

  test("bare Moonbeam lookup does NOT fall through to a Moonriver (1285) proposal", async () => {
    // Regression for the review Major: 1285 must not be in the multigov fallback.
    // A bare id that 404s on Ethereum and Moonbeam but exists on Moonriver must
    // return undefined (not the 1285 proposal, which would carry quorum: 0n and
    // the wrong environment when reached via the Moonbeam env). The
    // chainId-keyed implementation would surface a 1285 proposal if the fallback
    // ever regressed to include it — so the test fails loudly on regression.
    mockedFetchProposal.mockImplementation(async (_env, cid) => {
      if (cid === 1285) {
        return { ...baseApiProposal, chainId: 1285, proposalId: 7 };
      }
      throw new GovernorNotFoundError(cid, 7);
    });

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    expect(mockedFetchProposal).toHaveBeenCalledTimes(2);
    expect(mockedFetchProposal).not.toHaveBeenCalledWith(
      expect.anything(),
      1285,
      expect.anything(),
    );

    // clearAllMocks (this file's afterEach) doesn't drop implementations; reset
    // so the persistent impl doesn't leak into later tests' once-queues.
    mockedFetchProposal.mockReset();
  });

  test("re-throws non-404 errors without trying the next chain (indexer outage)", async () => {
    const upstream = new Error(
      "Failed to fetch proposal: 503 Service Unavailable",
    );
    mockedFetchProposal.mockRejectedValueOnce(upstream);

    await expect(
      getProposal(client, {
        network: "moonbeam",
        proposalId: 7,
      } as unknown as Parameters<typeof getProposal>[1]),
    ).rejects.toBe(upstream);

    // Only one chain tried — the loop bailed instead of masking the outage.
    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
  });

  test("explicit chainId=1284 skips chainId=1 entirely", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
    expect(mockedFetchProposal).toHaveBeenCalledWith(
      moonbeamEnv,
      MOONBEAM_CHAIN_ID,
      7,
    );
  });

  test("returns undefined for environments outside Moonbeam/Moonriver without calling fetcher", async () => {
    const baseEnv = {
      key: "base",
      chainId: 8453,
      governanceIndexerUrl: "https://mock-indexer.test",
      contracts: {},
      custom: {},
      config: {},
    } as unknown as Record<string, unknown>;
    const baseClient = {
      environments: { base: baseEnv },
    } as unknown as MoonwellClient;

    const result = await getProposal(baseClient, {
      network: "base",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    expect(mockedFetchProposal).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Moonriver routing branch (MOO-493) — single legacy governor, served by the
// same lunar indexer Governor API, never multichain.
// ---------------------------------------------------------------------------

describe("getProposal Moonriver via Governor API (MOO-493)", () => {
  test("routes through fetchProposal with chainId 1285 and no fallback (no Ponder)", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      id: "1285-0000000074",
      chainId: 1285,
      proposalId: 74,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonriver",
      proposalId: 74,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.chainId).toBe(1285);
    expect(result?.proposalId).toBe(74);
    // Exactly one call, pinned to chainId 1285 — Moonriver is never tried
    // against the Ethereum/Moonbeam chains, and the old Ponder path is gone.
    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
    expect(mockedFetchProposal).toHaveBeenCalledWith(moonriverEnv, 1285, 74);
    expect(mockedOnChain).toHaveBeenCalledWith(
      expect.any(Array),
      expect.anything(),
      expect.objectContaining({ crossChainQuorums: expect.any(Map) }),
    );
  });

  test("maps a non-multichain Moonriver proposal to the legacy Proposal shape", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      id: "1285-0000000074",
      chainId: 1285,
      proposalId: 74,
      description: "# MIP-R10: Test\nbody",
      // Legacy-governor signatures (selector lives here, not in the calldata) —
      // the mapper must pass them through for the frontend to decode the call.
      signatures: [
        "setDirectPrice(address,uint256)",
        "setFeed(string,address)",
      ],
    });
    mockedOnChain.mockResolvedValueOnce([
      { ...defaultOnChain, state: ProposalState.Succeeded, quorum: 123n },
    ]);

    const result = await getProposal(client, {
      network: "moonriver",
      proposalId: 74,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.id).toBe(74);
    expect(result?.state).toBe(ProposalState.Succeeded);
    expect(result?.quorum.exponential).toBe(123n);
    expect(result?.signatures).toEqual([
      "setDirectPrice(address,uint256)",
      "setFeed(string,address)",
    ]);
    // No multichain governor on Moonriver → the field must be absent.
    expect(result?.multichain).toBeUndefined();
    expect(result?.environment).toBe(moonriverEnv);
  });
});

// ---------------------------------------------------------------------------
// Mainnet routing branch — chainId=1 / network=mainnet must be served by the
// Moonbeam env, since the lunar indexer fans out both chainIds. Without these
// guards a future refactor of getEnvironmentFromArgs or the chainId routing
// could silently re-break Ethereum deep-links.
// ---------------------------------------------------------------------------

describe("getProposal mainnet routing", () => {
  const ethereumEnv = {
    key: "mainnet",
    chainId: ETHEREUM_CHAIN_ID,
    governanceIndexerUrl: "https://mock-indexer.test",
    contracts: {},
    custom: {},
    config: {},
  } as unknown as Record<string, unknown>;

  const dualClient = {
    environments: {
      mainnet: ethereumEnv,
      moonbeam: moonbeamEnv,
      moonriver: moonriverEnv,
    },
  } as unknown as MoonwellClient;

  test("chainId=1 routes through the Moonbeam env (not the Ethereum env)", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: ETHEREUM_CHAIN_ID,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(dualClient, {
      chainId: ETHEREUM_CHAIN_ID,
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.chainId).toBe(ETHEREUM_CHAIN_ID);
    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
    expect(mockedFetchProposal).toHaveBeenCalledWith(
      moonbeamEnv,
      ETHEREUM_CHAIN_ID,
      7,
    );
    // Critically, the Ethereum env must NOT be used as the indexer source.
    expect(mockedFetchProposal).not.toHaveBeenCalledWith(
      ethereumEnv,
      expect.anything(),
      expect.anything(),
    );
  });

  test("network=mainnet (no chainId) hits chainId=1 only — no fallback to 1284", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: ETHEREUM_CHAIN_ID,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    await getProposal(dualClient, {
      network: "mainnet",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(mockedFetchProposal).toHaveBeenCalledTimes(1);
    expect(mockedFetchProposal).toHaveBeenCalledWith(
      moonbeamEnv,
      ETHEREUM_CHAIN_ID,
      7,
    );
  });

  test("chainId=1 with no moonbeam env returns undefined without invoking fetchProposal", async () => {
    const ethereumOnlyClient = {
      environments: { mainnet: ethereumEnv },
    } as unknown as MoonwellClient;

    const result = await getProposal(ethereumOnlyClient, {
      chainId: ETHEREUM_CHAIN_ID,
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    expect(mockedFetchProposal).not.toHaveBeenCalled();
  });
});

describe("getProposal snapshotBlocks passthrough", () => {
  test("surfaces the indexer's per-chain snapshotBlocks unchanged", async () => {
    const snapshotBlocks = {
      mainnet: "25395850",
      base: "47807867",
      optimism: "153403152",
      moonbeam: "16179174",
    };
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
      snapshotBlocks,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.snapshotBlocks).toEqual(snapshotBlocks);
  });

  test("leaves snapshotBlocks undefined for proposals indexed before the field existed", async () => {
    mockedFetchProposal.mockResolvedValueOnce({
      ...baseApiProposal,
      chainId: MOONBEAM_CHAIN_ID,
    });
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
      chainId: MOONBEAM_CHAIN_ID,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result?.snapshotBlocks).toBeUndefined();
  });
});
