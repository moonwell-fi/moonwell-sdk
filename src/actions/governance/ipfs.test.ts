import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../environments/index.js";
import type { ApiProposal } from "./governor-api-client.js";

const ENV_NOOP = {
  chainId: 1284,
  onError: vi.fn(),
} as unknown as Environment;

// Mock axios so the gateway URL is asserted directly and no real HTTP fires.
vi.mock("axios", () => {
  const get = vi.fn();
  return { default: { get, isAxiosError: () => false } };
});

const axiosModule = await import("axios");
const mockedAxiosGet = vi.mocked(axiosModule.default.get);

// Import *after* the mock so the module-level cache is exercised against the
// mocked axios. Each test calls resetIpfsCacheForTesting via re-importing.
const importIpfsModule = async () => {
  vi.resetModules();
  return await import("./ipfs.js");
};

const HASH = "bafkreifs7zrxhb4rrxj6fwtiddymiejdtuu2ej2etcdvqnnrw5nyjbui4m";
const GATEWAY_URL = `https://d4529a05.mypinata.cloud/ipfs/${HASH}`;

describe("parseIpfsHash", () => {
  test("returns the hash for a valid ipfs:// URI", async () => {
    const { parseIpfsHash } = await importIpfsModule();
    expect(parseIpfsHash(`ipfs://${HASH}`)).toBe(HASH);
  });

  test("returns null for non-IPFS inputs", async () => {
    const { parseIpfsHash } = await importIpfsModule();
    expect(parseIpfsHash(undefined)).toBeNull();
    expect(parseIpfsHash("")).toBeNull();
    expect(parseIpfsHash("https://example.com/foo")).toBeNull();
    expect(parseIpfsHash("ipfs:/missing-second-slash")).toBeNull();
    expect(parseIpfsHash("ipfs://")).toBeNull(); // empty hash
  });
});

describe("fetchIpfsContent", () => {
  beforeEach(() => {
    mockedAxiosGet.mockReset();
  });

  test("hits the Pinata gateway with the parsed hash and returns the body", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: "# Hello world" });

    const { fetchIpfsContent } = await importIpfsModule();
    const body = await fetchIpfsContent(HASH);

    expect(body).toBe("# Hello world");
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      GATEWAY_URL,
      expect.objectContaining({ responseType: "text" }),
    );
  });

  test("caches by hash — second call with the same hash skips the network", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: "# Hello world" });

    const { fetchIpfsContent } = await importIpfsModule();
    const first = await fetchIpfsContent(HASH);
    const second = await fetchIpfsContent(HASH);

    expect(first).toBe("# Hello world");
    expect(second).toBe("# Hello world");
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
  });
});

describe("resolveIpfsDescriptions", () => {
  beforeEach(() => {
    mockedAxiosGet.mockReset();
  });

  const buildProposal = (description: string): ApiProposal =>
    ({
      proposalId: 1,
      chainId: 1,
      proposer: "0x0",
      description,
      targets: [],
      calldatas: [],
      forVotes: "0",
      againstVotes: "0",
      abstainVotes: "0",
      votingStartTime: 0,
      votingEndTime: 0,
      blockNumber: 0,
    }) as unknown as ApiProposal;

  test("replaces ipfs:// descriptions in place and leaves plain markdown untouched", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: "# Resolved markdown" });

    const ipfsProposal = buildProposal(`ipfs://${HASH}`);
    const plainProposal = buildProposal("# Already inlined");
    const proposals = [ipfsProposal, plainProposal];

    const { resolveIpfsDescriptions } = await importIpfsModule();
    await resolveIpfsDescriptions(proposals, ENV_NOOP);

    expect(ipfsProposal.description).toBe("# Resolved markdown");
    expect(plainProposal.description).toBe("# Already inlined");
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
  });

  test("leaves the ipfs:// URI in place when the fetch fails and does not reject", async () => {
    mockedAxiosGet.mockRejectedValueOnce(new Error("gateway down"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onError = vi.fn();
    const env = { chainId: 1284, onError } as unknown as Environment;

    const proposal = buildProposal(`ipfs://${HASH}`);

    const { resolveIpfsDescriptions } = await importIpfsModule();
    await expect(
      resolveIpfsDescriptions([proposal], env),
    ).resolves.toBeUndefined();
    expect(proposal.description).toBe(`ipfs://${HASH}`);
    expect(warnSpy).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      source: "governance-ipfs-description",
      chainId: proposal.chainId,
    });

    warnSpy.mockRestore();
  });

  test.each([
    ["object", { foo: "bar" }],
    ["null", null],
    ["undefined", undefined],
  ])(
    "non-string response body (%s) does not poison the cache — URI is preserved",
    async (_label, badBody) => {
      mockedAxiosGet.mockResolvedValueOnce({ data: badBody });
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const onError = vi.fn();
      const env = { chainId: 1284, onError } as unknown as Environment;

      const proposal = buildProposal(`ipfs://${HASH}`);
      const ipfs = await importIpfsModule();
      await ipfs.resolveIpfsDescriptions([proposal], env);

      expect(proposal.description).toBe(`ipfs://${HASH}`);
      expect(onError).toHaveBeenCalled();

      // A second resolve must not return the bad body from cache —
      // it should retry. Stub a good response and verify the URI is
      // replaced this time.
      mockedAxiosGet.mockResolvedValueOnce({ data: "# Good now" });
      const retry = buildProposal(`ipfs://${HASH}`);
      await ipfs.resolveIpfsDescriptions([retry], env);
      expect(retry.description).toBe("# Good now");

      warnSpy.mockRestore();
    },
  );
});
