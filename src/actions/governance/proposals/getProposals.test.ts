import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
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
};

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
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
