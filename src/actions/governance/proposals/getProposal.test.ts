import { afterEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
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
};

afterEach(() => {
  vi.clearAllMocks();
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

  test("returns undefined when both chains return NotFoundError", async () => {
    mockedFetchProposal
      .mockRejectedValueOnce(new GovernorNotFoundError(ETHEREUM_CHAIN_ID, 7))
      .mockRejectedValueOnce(new GovernorNotFoundError(MOONBEAM_CHAIN_ID, 7));

    const result = await getProposal(client, {
      network: "moonbeam",
      proposalId: 7,
    } as unknown as Parameters<typeof getProposal>[1]);

    expect(result).toBeUndefined();
    expect(mockedFetchProposal).toHaveBeenCalledTimes(2);
    expect(mockedOnChain).not.toHaveBeenCalled();
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
