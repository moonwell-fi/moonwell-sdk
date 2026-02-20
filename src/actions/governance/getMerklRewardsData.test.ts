import { afterEach, describe, expect, test, vi } from "vitest";
import { getMerklRewardsData } from "./common.js";

const CAMPAIGN_A =
  "0x0c3ec6a807049edd368e2493b6ab1f71557384c248013f5eee9cb375eead5faa";
const CAMPAIGN_B =
  "0xcd60ff26dc0b43f14c995c494bc5650087eaae68b279bdbe85e0e8eaa11fd513";
const CAMPAIGN_OTHER =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

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
