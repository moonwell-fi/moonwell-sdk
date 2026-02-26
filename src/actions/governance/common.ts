import type { Address } from "viem";
import { MOONWELL_FETCH_JSON_HEADERS } from "../../common/fetch-headers.js";

type MerklRewardsResponse = {
  chain: {
    id: number;
    name: string;
    icon: string;
    liveCampaigns: number;
    endOfDisputePeriod: number;
    Explorer: Array<{
      id: string;
      type: string;
      url: string;
      chainId: number;
    }>;
  };
  rewards: Array<{
    root: string;
    recipient: string;
    amount: string;
    claimed: string;
    pending: string;
    proofs: string[];
    token: {
      address: string;
      chainId: number;
      symbol: string;
      decimals: number;
      price: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: string;
      claimed: string;
      pending: string;
      campaignId: string;
      subCampaignId?: string;
    }>;
  }>;
};

type MerklReward = {
  chain: number;
  token: {
    address: string;
    chainId: number;
    symbol: string;
    decimals: number;
    price: number;
  };
  amount: string;
  claimed: string;
  pending: string;
};

const MAX_BREAKDOWN_PAGES = 10;

export async function getMerklRewardsData(
  campaignId: string[],
  chainId: number,
  account: Address,
): Promise<MerklReward[]> {
  try {
    const page0Response = await fetch(
      `https://api.merkl.xyz/v4/users/${account}/rewards?chainId=${chainId}&test=false&breakdownPage=0&reloadChainId=${chainId}`,
      {
        headers: MOONWELL_FETCH_JSON_HEADERS,
      },
    );

    if (!page0Response.ok) {
      console.warn(
        `Merkl API request failed: ${page0Response.status} ${page0Response.statusText}`,
      );
      return [];
    }

    const data = (await page0Response.json()) as MerklRewardsResponse[];

    if (data.length === 0) {
      return [];
    }

    // Paginate through remaining breakdown pages to collect all breakdowns
    for (let page = 1; page < MAX_BREAKDOWN_PAGES; page++) {
      const pageResponse = await fetch(
        `https://api.merkl.xyz/v4/users/${account}/rewards?chainId=${chainId}&test=false&breakdownPage=${page}&reloadChainId=${chainId}`,
        {
          headers: MOONWELL_FETCH_JSON_HEADERS,
        },
      );

      if (!pageResponse.ok) {
        break;
      }

      const pageData = (await pageResponse.json()) as MerklRewardsResponse[];

      const allBreakdownsEmpty = pageData.every((reward) =>
        reward.rewards.every((r) => r.breakdowns.length === 0),
      );

      if (allBreakdownsEmpty) {
        break;
      }

      // Merge breakdowns from this page into the page-0 data
      for (const pageReward of pageData) {
        const baseReward = data.find((d) => d.chain.id === pageReward.chain.id);
        if (!baseReward) continue;

        for (const pageRewardEntry of pageReward.rewards) {
          const baseRewardEntry = baseReward.rewards.find(
            (r) =>
              r.token.address.toLowerCase() ===
              pageRewardEntry.token.address.toLowerCase(),
          );
          if (baseRewardEntry) {
            baseRewardEntry.breakdowns.push(...pageRewardEntry.breakdowns);
          }
        }
      }
    }

    return data
      .filter((reward) =>
        reward.rewards.some((r) =>
          r.breakdowns.some((b) => campaignId.includes(b.campaignId)),
        ),
      )
      .flatMap((reward) =>
        reward.rewards
          .filter((r) =>
            r.breakdowns.some((b) => campaignId.includes(b.campaignId)),
          )
          .flatMap((r) =>
            r.breakdowns
              .filter((b) => campaignId.includes(b.campaignId))
              .map((b) => ({
                chain: reward.chain.id,
                token: r.token,
                amount: b.amount,
                claimed: b.claimed,
                pending: b.pending,
              })),
          ),
      );
  } catch (error) {
    console.error("Error in getMerklRewardsData:", error);
    return [];
  }
}

export async function getMerklStakingApr(campaignId: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.merkl.xyz/v4/campaigns?campaignId=${campaignId}`,
      {
        headers: MOONWELL_FETCH_JSON_HEADERS,
      },
    );

    if (!response.ok) {
      console.warn(
        `Merkl API request failed: ${response.status} ${response.statusText}`,
      );
      return 0;
    }

    const data = (await response.json()) as { apr: number }[];

    return data.reduce((acc, curr) => acc + Number(curr.apr), 0);
  } catch (error) {
    console.error("Error in getMerklStakingApr:", error);
    return 0;
  }
}
