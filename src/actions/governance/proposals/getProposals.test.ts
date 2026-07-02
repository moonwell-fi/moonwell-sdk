import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { ProposalState } from "../../../types/proposal.js";
import { type ApiProposal, fetchAllProposals } from "../governor-api-client.js";
import { type ProposalOnChainData, getProposalsOnChainData } from "./common.js";
import { getProposals } from "./getProposals.js";

vi.mock("../governor-api-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../governor-api-client.js")>();
  return { ...actual, fetchAllProposals: vi.fn() };
});

vi.mock("./common.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./common.js")>();
  return { ...actual, getProposalsOnChainData: vi.fn() };
});

const mockedFetchAll = vi.mocked(fetchAllProposals);
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

const client = {
  environments: { moonbeam: moonbeamEnv },
} as unknown as MoonwellClient;

const makeApiProposal = (chainId: number, proposalId: number): ApiProposal => ({
  id: `${chainId}-${String(proposalId).padStart(10, "0")}`,
  chainId,
  proposalId,
  proposer: "0x0000000000000000000000000000000000000001",
  targets: [],
  values: [],
  calldatas: [],
  votingStartTime: 0,
  votingEndTime: 0,
  description: "",
  forVotes: "0",
  againstVotes: "0",
  abstainVotes: "0",
  blockNumber: "1",
  timestamp: 0,
  transactionHash: "0xabc",
});

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

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

const WORMHOLE_TARGET = "0xc8e2b0cd52cf01b0ce87d389daa3d414d4ce29f3";
// A plain (non-bridge) contract target — the shape of a hub-local proposal that
// executes only on Ethereum (proposal-171 successor).
const LOCAL_TARGET = "0xed301cd3eb27217bdb05c4e9b820a8a3c8b665f9";

const executedStateChange = {
  id: "sc-1",
  proposalId: "1284-0000000007",
  state: "EXECUTED" as const,
  blockNumber: "1",
  timestamp: 1,
  transactionHash: "0xexec",
  forVotes: "0",
  againstVotes: "0",
  abstainVotes: "0",
  chainId: MOONBEAM_CHAIN_ID,
};

describe("getProposals empty-env short-circuit", () => {
  test("returns [] when no environment matches moonbeam/moonriver filter", async () => {
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

    const result = await getProposals(baseClient, {
      network: "base",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result).toEqual([]);
    expect(mockedFetchAll).not.toHaveBeenCalled();
  });
});

describe("getProposals state post-processing", () => {
  test("promotes Pending → Active when on-chain state is 0 and now is within voting window", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockedFetchAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        ...makeApiProposal(MOONBEAM_CHAIN_ID, 11),
        votingStartTime: now - 100,
        votingEndTime: now + 100,
      },
    ]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]); // state: 0

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.state).toBe(1); // ProposalState.Active
    // Regression guard against #3: the third argument carrying
    // `crossChainQuorums` must reach getProposalsOnChainData. A wiring
    // regression that drops it would still make the state assertion pass.
    expect(mockedOnChain).toHaveBeenCalledWith(
      expect.any(Array),
      expect.anything(),
      expect.objectContaining({ crossChainQuorums: expect.any(Map) }),
    );
  });

  test("EXECUTED state-change forces state=Executed regardless of on-chain state", async () => {
    mockedFetchAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        ...makeApiProposal(MOONBEAM_CHAIN_ID, 12),
        stateChanges: [executedStateChange],
      },
    ]);
    mockedOnChain.mockResolvedValueOnce([
      { ...defaultOnChain, state: 5 }, // even Queued gets overridden
    ]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.state).toBe(7); // ProposalState.Executed
    expect(result[0]?.executed).toBe(true);
  });

  test("multichain Succeeded with votesCollected past voting end → promoted to Queued", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockedFetchAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        ...makeApiProposal(MOONBEAM_CHAIN_ID, 13),
        targets: [WORMHOLE_TARGET],
        votingStartTime: now - 200,
        votingEndTime: now - 100,
      },
    ]);
    // Succeeded comes from getProposalsOnChainData already normalized to
    // ProposalState space (4). The consumer promotes it to Queued (5).
    mockedOnChain.mockResolvedValueOnce([
      {
        ...defaultOnChain,
        state: ProposalState.Succeeded,
        votesCollected: true,
        isMultichain: true,
      },
    ]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.state).toBe(ProposalState.Queued);
    expect(result[0]?.multichain).toEqual({
      id: 13,
      votesCollected: true,
    });
  });

  test("hub-local Ethereum proposal (chainId 1, no bridge target) Succeeded+collected → Queued — the next hub proposal", async () => {
    // proposal-171 successor shape in the list path: chainId 1, local-only
    // target. Mirrors the getProposal end-to-end guarantee so the proposals
    // list and the detail page render the same correct timeline state —
    // promoted to Queued with multichain.votesCollected true, and no bridge
    // target so the frontend keeps the single-chain Execute step.
    const now = Math.floor(Date.now() / 1000);
    mockedFetchAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        ...makeApiProposal(ETHEREUM_CHAIN_ID, 13),
        targets: [LOCAL_TARGET],
        votingStartTime: now - 200,
        votingEndTime: now - 100,
      },
    ]);
    mockedOnChain.mockResolvedValueOnce([
      {
        ...defaultOnChain,
        state: ProposalState.Succeeded,
        votesCollected: true,
        isMultichain: true,
      },
    ]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.state).toBe(ProposalState.Queued);
    expect(result[0]?.multichain).toEqual({ id: 13, votesCollected: true });
    expect(result[0]?.targets).toEqual([LOCAL_TARGET]);
  });

  test.each([
    ["Defeated", ProposalState.Defeated],
    ["Canceled", ProposalState.Canceled],
  ])(
    "multichain %s with votesCollected past voting end stays terminal (not promoted)",
    async (_label, terminalState) => {
      // Regression for the Critical: terminal failed states must not be
      // promoted to Queued just because `votesCollected: true`.
      const now = Math.floor(Date.now() / 1000);
      mockedFetchAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          ...makeApiProposal(MOONBEAM_CHAIN_ID, 13),
          targets: [WORMHOLE_TARGET],
          votingStartTime: now - 200,
          votingEndTime: now - 100,
        },
      ]);
      mockedOnChain.mockResolvedValueOnce([
        {
          ...defaultOnChain,
          state: terminalState,
          votesCollected: true,
          isMultichain: true,
        },
      ]);

      const result = await getProposals(client, {
        network: "moonbeam",
      } as unknown as Parameters<typeof getProposals>[1]);

      expect(result[0]?.state).toBe(terminalState);
    },
  );
});

describe("getProposals sort + partial-failure behavior", () => {
  test("tiebreaker on proposalId puts smaller chainId (Ethereum) first", async () => {
    mockedFetchAll
      .mockResolvedValueOnce([makeApiProposal(ETHEREUM_CHAIN_ID, 1)])
      .mockResolvedValueOnce([makeApiProposal(MOONBEAM_CHAIN_ID, 1)]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain, defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result.map((p) => p.chainId)).toEqual([
      ETHEREUM_CHAIN_ID,
      MOONBEAM_CHAIN_ID,
    ]);
  });

  test("sorts strictly by proposalId desc when proposalIds don't collide", async () => {
    mockedFetchAll
      .mockResolvedValueOnce([makeApiProposal(ETHEREUM_CHAIN_ID, 3)])
      .mockResolvedValueOnce([
        makeApiProposal(MOONBEAM_CHAIN_ID, 10),
        makeApiProposal(MOONBEAM_CHAIN_ID, 5),
      ]);
    mockedOnChain.mockResolvedValueOnce([
      defaultOnChain,
      defaultOnChain,
      defaultOnChain,
    ]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result.map((p) => p.proposalId)).toEqual([10, 5, 3]);
  });

  test("partial outage on chainId=1 still returns Moonbeam historical via allSettled", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockedFetchAll
      .mockRejectedValueOnce(new Error("503 ethereum indexer down"))
      .mockResolvedValueOnce([
        makeApiProposal(MOONBEAM_CHAIN_ID, 100),
        makeApiProposal(MOONBEAM_CHAIN_ID, 99),
      ]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain, defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.chainId === MOONBEAM_CHAIN_ID)).toBe(true);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("chainId=1"),
      expect.anything(),
    );
  });

  test("partial outage on chainId=1284 still returns Ethereum proposals", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockedFetchAll
      .mockResolvedValueOnce([makeApiProposal(ETHEREUM_CHAIN_ID, 2)])
      .mockRejectedValueOnce(new Error("503 moonbeam historical down"));
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result).toHaveLength(1);
    expect(result[0]?.chainId).toBe(ETHEREUM_CHAIN_ID);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("chainId=1284"),
      expect.anything(),
    );
  });
});

describe("getProposals snapshotBlocks passthrough", () => {
  const snapshotBlocks = {
    mainnet: "25395850",
    base: "47807867",
    optimism: "153403152",
    moonbeam: "16179174",
  };

  test("surfaces the indexer's per-chain snapshotBlocks on each listed proposal unchanged", async () => {
    mockedFetchAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { ...makeApiProposal(MOONBEAM_CHAIN_ID, 50), snapshotBlocks },
      ]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    // Surfaced verbatim — no key normalization, no derivation from blockNumber.
    expect(result[0]?.snapshotBlocks).toEqual(snapshotBlocks);
  });

  test("leaves snapshotBlocks undefined for proposals indexed before the field existed", async () => {
    mockedFetchAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([makeApiProposal(MOONBEAM_CHAIN_ID, 51)]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.snapshotBlocks).toBeUndefined();
  });

  test("passes a partial snapshotBlocks map through without filling in the missing chains", async () => {
    // The indexer may omit a chain (e.g. it hasn't resolved that chain's
    // snapshot yet). The SDK must not invent or backfill blocks — the frontend
    // relies on the absence to fall back to timestamp resolution per chain.
    const partial = { mainnet: "25395850", base: "47807867" };
    mockedFetchAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { ...makeApiProposal(MOONBEAM_CHAIN_ID, 52), snapshotBlocks: partial },
      ]);
    mockedOnChain.mockResolvedValueOnce([defaultOnChain]);

    const result = await getProposals(client, {
      network: "moonbeam",
    } as unknown as Parameters<typeof getProposals>[1]);

    expect(result[0]?.snapshotBlocks).toEqual(partial);
    expect(result[0]?.snapshotBlocks?.optimism).toBeUndefined();
    expect(result[0]?.snapshotBlocks?.moonbeam).toBeUndefined();
  });
});
