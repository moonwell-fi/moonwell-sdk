import type { Address } from "viem";
import { MOONWELL_FETCH_JSON_HEADERS } from "../../common/fetch-headers.js";
import { getMerklProxyBaseUrl } from "../../common/lunar-indexer-helpers.js";

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

type MerklCampaign = {
  campaignId: string;
  apr: number;
  startTimestamp: number;
  endTimestamp: number;
  params: {
    targetToken: string;
  };
};

type CampaignIdsCache = {
  ids: string[];
  fetchedAt: number;
};

type MerklBreakdown =
  MerklRewardsResponse["rewards"][number]["breakdowns"][number];

const MOONWELL_MERKL_CREATOR = "0x8b621804a7637b781e2BbD58e256a591F2dF7d51";
const CAMPAIGN_IDS_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const MAX_BREAKDOWN_PAGES = 10;

/**
 * Stable identity for a Merkl reward breakdown. The Merkl `/rewards` endpoint
 * clamps an out-of-range `breakdownPage` back to the first page instead of
 * returning an empty page, so appending each page's breakdowns blindly
 * re-counts the same rewards and inflates the total by the page count (up to
 * 10x). Keying on the full breakdown content lets us skip exact repeats while
 * still keeping genuinely distinct distributions that share a campaignId.
 */
const breakdownKey = (b: MerklBreakdown): string =>
  `${b.campaignId}|${b.reason}|${b.amount}|${b.claimed}|${b.pending}|${b.subCampaignId ?? ""}`;

let campaignIdsCache: CampaignIdsCache | null = null;

/** Resets the in-memory campaign IDs cache. Intended for use in tests only. */
export function resetMerklCampaignIdsCache(): void {
  campaignIdsCache = null;
}

/**
 * Fetches all Moonwell Merkl campaign IDs from the API.
 * Results are cached in memory for 4 hours since campaigns only change monthly.
 */
export async function getMerklCampaignIds(
  lunarIndexerUrl?: string,
): Promise<string[]> {
  const now = Date.now();
  // The cache intentionally ignores `lunarIndexerUrl`: the Moonwell campaign set
  // is the same regardless of which proxy host serves it, so a differing URL
  // within the TTL still returns the cached IDs.
  if (
    campaignIdsCache !== null &&
    now - campaignIdsCache.fetchedAt < CAMPAIGN_IDS_CACHE_TTL_MS
  ) {
    return campaignIdsCache.ids;
  }

  try {
    const response = await fetch(
      `${getMerklProxyBaseUrl(lunarIndexerUrl)}/campaigns?creatorAddress=${MOONWELL_MERKL_CREATOR}&excludeSubCampaigns=true&items=100`,
      { headers: MOONWELL_FETCH_JSON_HEADERS },
    );

    if (!response.ok) {
      console.warn(
        `Merkl API request failed: ${response.status} ${response.statusText}`,
      );
      return campaignIdsCache?.ids ?? [];
    }

    const data = (await response.json()) as MerklCampaign[];
    const ids = data.map((c) => c.campaignId);
    campaignIdsCache = { ids, fetchedAt: now };
    return ids;
  } catch (error) {
    console.error("Error in getMerklCampaignIds:", error);
    return campaignIdsCache?.ids ?? [];
  }
}

export async function getMerklRewardsData(
  campaignId: string[],
  chainId: number,
  account: Address,
  lunarIndexerUrl?: string,
): Promise<MerklReward[]> {
  const merklProxyBaseUrl = getMerklProxyBaseUrl(lunarIndexerUrl);
  try {
    const page0Response = await fetch(
      `${merklProxyBaseUrl}/users/${account}/rewards?chainId=${chainId}&test=false&breakdownPage=0&reloadChainId=${chainId}`,
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

    // Track breakdowns already collected (seeded from page 0) so repeated
    // pages don't double-count. See breakdownKey for why Merkl repeats them.
    const seenBreakdowns = new Set(
      data.flatMap((reward) =>
        reward.rewards.flatMap((r) => r.breakdowns.map(breakdownKey)),
      ),
    );

    // Paginate through remaining breakdown pages to collect all breakdowns
    for (let page = 1; page < MAX_BREAKDOWN_PAGES; page++) {
      const pageResponse = await fetch(
        `${merklProxyBaseUrl}/users/${account}/rewards?chainId=${chainId}&test=false&breakdownPage=${page}&reloadChainId=${chainId}`,
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

      // Merge only breakdowns we haven't collected yet.
      let addedNewBreakdown = false;
      for (const pageReward of pageData) {
        const baseReward = data.find((d) => d.chain.id === pageReward.chain.id);
        if (!baseReward) continue;

        for (const pageRewardEntry of pageReward.rewards) {
          const baseRewardEntry = baseReward.rewards.find(
            (r) =>
              r.token.address.toLowerCase() ===
              pageRewardEntry.token.address.toLowerCase(),
          );
          if (!baseRewardEntry) continue;

          for (const breakdown of pageRewardEntry.breakdowns) {
            const key = breakdownKey(breakdown);
            if (seenBreakdowns.has(key)) continue;
            seenBreakdowns.add(key);
            baseRewardEntry.breakdowns.push(breakdown);
            addedNewBreakdown = true;
          }
        }
      }

      // A page that only repeats breakdowns we've already seen means the API
      // has stopped advancing (out-of-range page clamped to page 0), so
      // continuing would just re-count the same rewards.
      if (!addedNewBreakdown) {
        break;
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

export async function getMerklStakingApr(
  contractAddress: string,
  lunarIndexerUrl?: string,
): Promise<number> {
  const now = Math.floor(Date.now() / 1000);

  try {
    const response = await fetch(
      `${getMerklProxyBaseUrl(lunarIndexerUrl)}/campaigns?creatorAddress=${MOONWELL_MERKL_CREATOR}&excludeSubCampaigns=true&items=100`,
      { headers: MOONWELL_FETCH_JSON_HEADERS },
    );

    if (!response.ok) {
      console.warn(
        `Merkl API request failed: ${response.status} ${response.statusText}`,
      );
      return 0;
    }

    const data = (await response.json()) as MerklCampaign[];

    return data
      .filter((c) => c.startTimestamp <= now && c.endTimestamp >= now)
      .filter(
        (c) =>
          c.params.targetToken.toLowerCase() === contractAddress.toLowerCase(),
      )
      .reduce((acc, c) => acc + Number(c.apr), 0);
  } catch (error) {
    console.error("Error in getMerklStakingApr:", error);
    return 0;
  }
}
