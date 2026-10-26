import { afterEach, describe, expect, test, vi } from "vitest";
import type { Environment } from "../../../environments/index.js";
import { getVaultV2Apy } from "./graphql.js";

const environment = { custom: {} } as unknown as Environment;
const VAULT = "0x89BeDBB1C4837444Da215A377275Ff96A84D6f53";

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn(() =>
    Promise.resolve({
      status,
      statusText: status === 200 ? "OK" : "Bad Request",
      json: () => Promise.resolve(body),
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sentQuery(fetchMock: ReturnType<typeof stubFetch>): string {
  const init = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  return JSON.parse(init[1].body as string).query;
}

describe("getVaultV2Apy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Morpho removed VaultV2.avgApy and VaultStateReward.yearlySupplyTokens;
  // selecting either fails validation for the whole query (HTTP 400), so
  // every V2 vault lost its APY in the on-chain fallback path.
  test("does not select fields removed from the Morpho schema", async () => {
    const fetchMock = stubFetch(200, { data: { vaultV2ByAddress: null } });

    await getVaultV2Apy(environment, VAULT, 8453);

    const query = sentQuery(fetchMock);
    expect(query).not.toMatch(/\bavgApy\b/);
    expect(query).not.toMatch(/\byearlySupplyTokens\b/);
    expect(query).toMatch(/\bavgNetApy\b/);
  });

  test("returns vaultV2ByAddress on success", async () => {
    const vault = { address: VAULT, avgNetApy: 0.0112, liquidityUsd: 2690 };
    stubFetch(200, { data: { vaultV2ByAddress: vault } });

    await expect(getVaultV2Apy(environment, VAULT, 8453)).resolves.toEqual(
      vault,
    );
  });

  test("returns undefined when the API rejects the query", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch(400, {
      errors: [{ message: 'Cannot query field "avgApy" on type "VaultV2".' }],
    });

    await expect(
      getVaultV2Apy(environment, VAULT, 8453),
    ).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      "[Morpho V2 APY] Non-200 (Bad Request) or errors:",
      expect.stringContaining("avgApy"),
    );
  });
});
