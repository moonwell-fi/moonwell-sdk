import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  getMerklCampaignIds,
  getMerklRewardsData,
  getMerklStakingApr,
  resetMerklCampaignIdsCache,
} from "./common.js";

const CAMPAIGN_A =
  "0x0c3ec6a807049edd368e2493b6ab1f71557384c248013f5eee9cb375eead5faa";
const CAMPAIGN_B =
  "0xcd60ff26dc0b43f14c995c494bc5650087eaae68b279bdbe85e0e8eaa11fd513";
const CAMPAIGN_OTHER =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const STKWELL_ADDRESS = "0xe66E3A37C3274Ac24FE8590f7D84A2427194DC17";
const OTHER_TOKEN_ADDRESS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const WELL_TOKEN = {
  address: "0xA88594D404727625A9437C3f886C7643872296AE",
  chainId: 8453,
  symbol: "WELL",
  decimals: 18,
  price: 0.004,
};

function makeMerklResponse(
  breakdowns: Array<{
    campaignId: string;
    amount: string;
    claimed: string;
    pending: string;
    subCampaignId?: string;
  }>,
) {
  return [
    {
      chain: {
        id: 8453,
        name: "Base",
        icon: "",
        liveCampaigns: 1,
        endOfDisputePeriod: 0,
        Explorer: [],
      },
      rewards: [
        {
          root: "0x",
          recipient: "0x",
          amount: "1000000000000000000",
          claimed: "0",
          pending: "0",
          proofs: [],
          token: WELL_TOKEN,
          breakdowns: breakdowns.map((b) => ({
            reason: "campaign",
            amount: b.amount,
            claimed: b.claimed,
            pending: b.pending,
            campaignId: b.campaignId,
            ...(b.subCampaignId ? { subCampaignId: b.subCampaignId } : {}),
          })),
        },
      ],
    },
  ];
}

function makeEmptyBreakdownResponse() {
  return [
    {
      chain: {
        id: 8453,
        name: "Base",
        icon: "",
        liveCampaigns: 1,
        endOfDisputePeriod: 0,
        Explorer: [],
      },
      rewards: [
        {
          root: "0x",
          recipient: "0x",
          amount: "1000000000000000000",
          claimed: "0",
          pending: "0",
          proofs: [],
          token: WELL_TOKEN,
          breakdowns: [],
        },
      ],
    },
  ];
}

function mockFetchResponses(
  responses: Array<
    | { ok: true; data: any }
    | { ok: false; status: number; statusText: string }
    | { throws: Error }
  >,
) {
  let callIndex = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      const resp = responses[callIndex] ?? responses[responses.length - 1]!;
      callIndex++;

      if ("throws" in resp) {
        return Promise.reject(resp.throws);
      }

      if (!resp.ok) {
        return Promise.resolve({
          ok: false,
          status: resp.status,
          statusText: resp.statusText,
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(resp.data),
      });
    }),
  );
}

describe("getMerklRewardsData", () => {
  beforeEach(() => {
    resetMerklCampaignIdsCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns matching breakdowns from page 0", async () => {
    mockFetchResponses([
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_A,
            amount: "500",
            claimed: "100",
            pending: "0",
          },
          {
            campaignId: CAMPAIGN_OTHER,
            amount: "200",
            claimed: "0",
            pending: "0",
          },
        ]),
      },
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A, CAMPAIGN_B],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.amount).toBe("500");
    expect(result[0]!.claimed).toBe("100");
    expect(result[0]!.token.symbol).toBe("WELL");
  });

  test("finds breakdowns on page 1 when not on page 0", async () => {
    mockFetchResponses([
      // Page 0: breakdowns that don't match target campaigns
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_OTHER,
            amount: "200",
            claimed: "0",
            pending: "0",
          },
        ]),
      },
      // Page 1: has the target campaign
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_A,
            amount: "500",
            claimed: "100",
            pending: "0",
          },
        ]),
      },
      // Page 2: empty breakdowns
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.amount).toBe("500");
    expect(result[0]!.claimed).toBe("100");
  });

  test("returns empty array when page 0 response is empty", async () => {
    mockFetchResponses([{ ok: true, data: [] }]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("returns empty array when page 0 API errors", async () => {
    mockFetchResponses([
      { ok: false, status: 500, statusText: "Internal Server Error" },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("uses partial data when API errors on page N > 0", async () => {
    mockFetchResponses([
      // Page 0: has a matching campaign
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_A,
            amount: "500",
            claimed: "100",
            pending: "0",
          },
        ]),
      },
      // Page 1: API error
      { ok: false, status: 502, statusText: "Bad Gateway" },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.amount).toBe("500");
  });

  test("preserves multiple breakdowns with the same campaignId", async () => {
    // Merkl returns multiple breakdowns per campaign (different distribution rounds)
    mockFetchResponses([
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_A,
            amount: "1416216042018414062",
            claimed: "984511158382229090",
            pending: "0",
          },
          {
            campaignId: CAMPAIGN_A,
            amount: "1192189467277783480",
            claimed: "985317408962611521",
            pending: "0",
          },
        ]),
      },
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(2);
    expect(result[0]!.amount).toBe("1416216042018414062");
    expect(result[1]!.amount).toBe("1192189467277783480");
  });

  test("skips tokens on later pages that are not present on page 0", async () => {
    const page0 = [
      {
        chain: {
          id: 8453,
          name: "Base",
          icon: "",
          liveCampaigns: 1,
          endOfDisputePeriod: 0,
          Explorer: [],
        },
        rewards: [
          {
            root: "0x",
            recipient: "0x",
            amount: "1000",
            claimed: "0",
            pending: "0",
            proofs: [],
            token: WELL_TOKEN,
            breakdowns: [
              {
                reason: "campaign",
                campaignId: CAMPAIGN_OTHER,
                amount: "1000",
                claimed: "0",
                pending: "0",
              },
            ],
          },
        ],
      },
    ];

    const page1WithNewToken = [
      {
        chain: {
          id: 8453,
          name: "Base",
          icon: "",
          liveCampaigns: 1,
          endOfDisputePeriod: 0,
          Explorer: [],
        },
        rewards: [
          {
            root: "0x",
            recipient: "0x",
            amount: "500",
            claimed: "0",
            pending: "0",
            proofs: [],
            token: {
              address: "0xNEWTOKEN",
              chainId: 8453,
              symbol: "NEW",
              decimals: 18,
              price: 1,
            },
            breakdowns: [
              {
                reason: "campaign",
                campaignId: CAMPAIGN_A,
                amount: "500",
                claimed: "0",
                pending: "0",
              },
            ],
          },
        ],
      },
    ];

    mockFetchResponses([
      { ok: true, data: page0 },
      { ok: true, data: page1WithNewToken },
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    // Campaign A was only on the new token which wasn't on page 0, so it gets skipped
    expect(result).toHaveLength(0);
  });

  test("stops pagination at MAX_BREAKDOWN_PAGES", async () => {
    // Every page returns non-empty breakdowns that don't match
    const nonMatchingPage = makeMerklResponse([
      { campaignId: CAMPAIGN_OTHER, amount: "100", claimed: "0", pending: "0" },
    ]);

    mockFetchResponses([
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      { ok: true, data: nonMatchingPage },
      // 11th call should never happen
      { ok: true, data: nonMatchingPage },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    // 1 call for page 0 + 9 calls for pages 1-9 = 10 total
    expect(fetch).toHaveBeenCalledTimes(10);
    expect(result).toHaveLength(0);
  });

  test("returns empty array when fetch throws an exception", async () => {
    mockFetchResponses([{ throws: new Error("Network error") }]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toEqual([]);
  });

  test("collects campaigns spread across multiple pages", async () => {
    mockFetchResponses([
      // Page 0: campaign A
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_A,
            amount: "300",
            claimed: "50",
            pending: "0",
          },
          {
            campaignId: CAMPAIGN_OTHER,
            amount: "100",
            claimed: "0",
            pending: "0",
          },
        ]),
      },
      // Page 1: campaign B
      {
        ok: true,
        data: makeMerklResponse([
          {
            campaignId: CAMPAIGN_B,
            amount: "700",
            claimed: "200",
            pending: "0",
          },
        ]),
      },
      // Page 2: empty
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A, CAMPAIGN_B],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(2);

    const campaignAResult = result.find((r) => r.amount === "300");
    const campaignBResult = result.find((r) => r.amount === "700");

    expect(campaignAResult).toBeDefined();
    expect(campaignAResult!.claimed).toBe("50");
    expect(campaignBResult).toBeDefined();
    expect(campaignBResult!.claimed).toBe("200");
  });

  test("filters out non-matching campaigns from results", async () => {
    mockFetchResponses([
      {
        ok: true,
        data: makeMerklResponse([
          { campaignId: CAMPAIGN_A, amount: "500", claimed: "0", pending: "0" },
          {
            campaignId: CAMPAIGN_OTHER,
            amount: "999",
            claimed: "0",
            pending: "0",
          },
        ]),
      },
      { ok: true, data: makeEmptyBreakdownResponse() },
    ]);

    const result = await getMerklRewardsData(
      [CAMPAIGN_A],
      8453,
      "0x1234567890abcdef1234567890abcdef12345678",
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.amount).toBe("500");
  });
});

function makeCampaignsResponse(
  campaigns: Array<{
    campaignId: string;
    apr?: number;
    startTimestamp?: number;
    endTimestamp?: number;
  }>,
) {
  const now = Math.floor(Date.now() / 1000);
  return campaigns.map((c) => ({
    campaignId: c.campaignId,
    apr: c.apr ?? 0,
    startTimestamp: c.startTimestamp ?? now - 3600,
    endTimestamp: c.endTimestamp ?? now + 3600,
  }));
}

describe("getMerklCampaignIds", () => {
  beforeEach(() => {
    resetMerklCampaignIdsCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns campaign IDs from API", async () => {
    mockFetchResponses([
      {
        ok: true,
        data: makeCampaignsResponse([
          { campaignId: CAMPAIGN_A },
          { campaignId: CAMPAIGN_B },
        ]),
      },
    ]);

    const result = await getMerklCampaignIds();

    expect(result).toEqual([CAMPAIGN_A, CAMPAIGN_B]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("returns cached result on second call", async () => {
    mockFetchResponses([
      {
        ok: true,
        data: makeCampaignsResponse([{ campaignId: CAMPAIGN_A }]),
      },
    ]);

    await getMerklCampaignIds();
    const result = await getMerklCampaignIds();

    expect(result).toEqual([CAMPAIGN_A]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("returns empty array on API error with no prior cache", async () => {
    mockFetchResponses([
      { ok: false, status: 500, statusText: "Internal Server Error" },
    ]);

    const result = await getMerklCampaignIds();

    expect(result).toEqual([]);
  });

  test("returns stale cache on API error when cache exists", async () => {
    mockFetchResponses([
      {
        ok: true,
        data: makeCampaignsResponse([{ campaignId: CAMPAIGN_A }]),
      },
      { ok: false, status: 503, statusText: "Service Unavailable" },
    ]);

    // Populate cache
    await getMerklCampaignIds();
    resetMerklCampaignIdsCache();

    // Re-populate so we have a cache entry, then simulate expiry via second call failing
    mockFetchResponses([
      {
        ok: true,
        data: makeCampaignsResponse([{ campaignId: CAMPAIGN_A }]),
      },
      { ok: false, status: 503, statusText: "Service Unavailable" },
    ]);
    await getMerklCampaignIds();

    // Force cache to appear expired by overriding fetch to fail
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          statusText: "Service Unavailable",
        }),
      ),
    );

    const result = await getMerklCampaignIds();
    expect(result).toEqual([CAMPAIGN_A]);
  });

  test("returns empty array when fetch throws", async () => {
    mockFetchResponses([{ throws: new Error("Network error") }]);

    const result = await getMerklCampaignIds();

    expect(result).toEqual([]);
  });
});

describe("getMerklStakingApr", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns APR of the currently live campaign", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockFetchResponses([
      {
        ok: true,
        data: [
          {
            campaignId: CAMPAIGN_A,
            apr: 12.5,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
        ],
      },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(12.5);
  });

  test("sums APRs when multiple campaigns for the same token are live", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockFetchResponses([
      {
        ok: true,
        data: [
          {
            campaignId: CAMPAIGN_A,
            apr: 10,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
          {
            campaignId: CAMPAIGN_B,
            apr: 5,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
        ],
      },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(15);
  });

  test("ignores campaigns for other tokens", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockFetchResponses([
      {
        ok: true,
        data: [
          {
            campaignId: CAMPAIGN_A,
            apr: 9.87,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
          {
            campaignId: CAMPAIGN_B,
            apr: 2.28,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: OTHER_TOKEN_ADDRESS },
          },
        ],
      },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBeCloseTo(9.87);
  });

  test("ignores expired campaigns", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockFetchResponses([
      {
        ok: true,
        data: [
          {
            campaignId: CAMPAIGN_A,
            apr: 8,
            startTimestamp: now - 7200,
            endTimestamp: now - 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
          {
            campaignId: CAMPAIGN_B,
            apr: 12,
            startTimestamp: now - 3600,
            endTimestamp: now + 3600,
            params: { targetToken: STKWELL_ADDRESS },
          },
        ],
      },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(12);
  });

  test("ignores campaigns that have not started yet", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockFetchResponses([
      {
        ok: true,
        data: [
          {
            campaignId: CAMPAIGN_A,
            apr: 10,
            startTimestamp: now + 3600,
            endTimestamp: now + 7200,
            params: { targetToken: STKWELL_ADDRESS },
          },
        ],
      },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(0);
  });

  test("returns 0 on API error", async () => {
    mockFetchResponses([
      { ok: false, status: 500, statusText: "Internal Server Error" },
    ]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(0);
  });

  test("returns 0 when fetch throws", async () => {
    mockFetchResponses([{ throws: new Error("Network error") }]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(0);
  });

  test("returns 0 when no campaigns are returned", async () => {
    mockFetchResponses([{ ok: true, data: [] }]);

    const result = await getMerklStakingApr(STKWELL_ADDRESS);

    expect(result).toBe(0);
  });
});
