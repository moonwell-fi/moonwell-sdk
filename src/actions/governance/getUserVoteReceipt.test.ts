import { afterEach, describe, expect, test, vi } from "vitest";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { getUserVoteReceipt } from "./getUserVoteReceipt.js";
import {
  type ApiVoteReceipt,
  GovernorNotFoundError,
  fetchUserVoteReceipt,
} from "./governor-api-client.js";

vi.mock("./governor-api-client.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./governor-api-client.js")>();
  return { ...actual, fetchUserVoteReceipt: vi.fn() };
});

const mockedFetch = vi.mocked(fetchUserVoteReceipt);

const ETHEREUM_CHAIN_ID = 1;
const MOONBEAM_CHAIN_ID = 1284;
const USER_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const;

const moonbeamEnv = {
  key: "moonbeam",
  chainId: MOONBEAM_CHAIN_ID,
  governanceIndexerUrl: "https://mock-indexer.test",
  contracts: {},
  custom: {},
  config: {},
} as unknown as Record<string, unknown>;

const ethereumEnv = {
  key: "ethereum",
  chainId: ETHEREUM_CHAIN_ID,
  governanceIndexerUrl: "https://mock-indexer.test",
  contracts: {},
  custom: {},
  config: {},
} as unknown as Record<string, unknown>;

const client = {
  environments: { moonbeam: moonbeamEnv, ethereum: ethereumEnv },
} as unknown as MoonwellClient;

const makeReceipt = (chainId: number, votes: string): ApiVoteReceipt => ({
  id: `${chainId}-1`,
  proposalId: `${chainId}-0000000007`,
  voter: USER_ADDRESS,
  votes,
  voteValue: 0,
  blockNumber: "1",
  chainId,
  timestamp: 0,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getUserVoteReceipt", () => {
  test("returns receipts from chainId=1 when only that chain has votes", async () => {
    mockedFetch
      .mockResolvedValueOnce([makeReceipt(ETHEREUM_CHAIN_ID, "1000")])
      .mockResolvedValueOnce([]); // chainId=1284 → proposal exists, user didn't vote

    const result = await getUserVoteReceipt(client, {
      network: "moonbeam",
      proposalId: 7,
      userAddress: USER_ADDRESS,
    } as unknown as Parameters<typeof getUserVoteReceipt>[1]);

    expect(result).toHaveLength(1);
    expect(result[0]?.voted).toBe(true);
    expect(result[0]?.chainId).toBe(ETHEREUM_CHAIN_ID);
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  test("concatenates receipts from BOTH chains (proposalId collision case)", async () => {
    // proposalId=7 happens to exist on both chains as different proposals; the
    // same wallet voted on each. Caller should see both receipts, not just the
    // first chain's.
    mockedFetch
      .mockResolvedValueOnce([makeReceipt(ETHEREUM_CHAIN_ID, "1000")])
      .mockResolvedValueOnce([makeReceipt(MOONBEAM_CHAIN_ID, "500")]);

    const result = await getUserVoteReceipt(client, {
      network: "moonbeam",
      proposalId: 7,
      userAddress: USER_ADDRESS,
    } as unknown as Parameters<typeof getUserVoteReceipt>[1]);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.chainId).sort()).toEqual([1, 1284]);
  });

  test("does not stop on a 200-empty response — would otherwise miss the other chain's vote", async () => {
    mockedFetch
      .mockResolvedValueOnce([]) // chainId=1: proposal exists, user didn't vote
      .mockResolvedValueOnce([makeReceipt(MOONBEAM_CHAIN_ID, "750")]);

    const result = await getUserVoteReceipt(client, {
      network: "moonbeam",
      proposalId: 7,
      userAddress: USER_ADDRESS,
    } as unknown as Parameters<typeof getUserVoteReceipt>[1]);

    expect(result).toHaveLength(1);
    expect(result[0]?.chainId).toBe(MOONBEAM_CHAIN_ID);
  });

  test("returns the empty-vote stub when both chains acknowledge but neither has receipts", async () => {
    mockedFetch.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const result = await getUserVoteReceipt(client, {
      network: "moonbeam",
      proposalId: 7,
      userAddress: USER_ADDRESS,
    } as unknown as Parameters<typeof getUserVoteReceipt>[1]);

    expect(result).toHaveLength(1);
    expect(result[0]?.voted).toBe(false);
    expect(result[0]?.account).toBe(USER_ADDRESS);
  });

  test("throws GovernorNotFoundError when both chains return 404 (proposal genuinely doesn't exist)", async () => {
    mockedFetch
      .mockRejectedValueOnce(new GovernorNotFoundError(ETHEREUM_CHAIN_ID, 7))
      .mockRejectedValueOnce(new GovernorNotFoundError(MOONBEAM_CHAIN_ID, 7));

    await expect(
      getUserVoteReceipt(client, {
        network: "moonbeam",
        proposalId: 7,
        userAddress: USER_ADDRESS,
      } as unknown as Parameters<typeof getUserVoteReceipt>[1]),
    ).rejects.toBeInstanceOf(GovernorNotFoundError);
  });

  test("re-throws non-404 errors immediately (indexer outage isn't a 'didn't vote' result)", async () => {
    const upstream = new Error("500 Internal Server Error");
    mockedFetch.mockRejectedValueOnce(upstream);

    await expect(
      getUserVoteReceipt(client, {
        network: "moonbeam",
        proposalId: 7,
        userAddress: USER_ADDRESS,
      } as unknown as Parameters<typeof getUserVoteReceipt>[1]),
    ).rejects.toBe(upstream);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  test("explicit chainId skips the other chain even on 404", async () => {
    mockedFetch.mockRejectedValueOnce(
      new GovernorNotFoundError(ETHEREUM_CHAIN_ID, 7),
    );

    await expect(
      getUserVoteReceipt(client, {
        network: "moonbeam",
        proposalId: 7,
        userAddress: USER_ADDRESS,
        chainId: ETHEREUM_CHAIN_ID,
      } as unknown as Parameters<typeof getUserVoteReceipt>[1]),
    ).rejects.toBeInstanceOf(GovernorNotFoundError);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch.mock.calls[0]?.[1]).toBe(ETHEREUM_CHAIN_ID);
  });
});
