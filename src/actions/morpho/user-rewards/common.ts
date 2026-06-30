import { type Address, getContract, parseAbi, zeroAddress } from "viem";
import { Amount } from "../../../common/amount.js";
import { MOONWELL_FETCH_JSON_HEADERS } from "../../../common/fetch-headers.js";
import { getMerklProxyBaseUrl } from "../../../common/lunar-indexer-helpers.js";
import {
  type Environment,
  type TokenConfig,
  publicEnvironments,
} from "../../../environments/index.js";
import {
  findMarketByAddress,
  findTokenByAddress,
} from "../../../environments/utils/index.js";
import type { MorphoUserReward } from "../../../types/morphoUserReward.js";
import type { MorphoUserStakingReward } from "../../../types/morphoUserStakingReward.js";
import { getGovernanceTokenPriceFor } from "../../governance/getWellPrice.js";

/**
 * Error thrown for any failure communicating with the Merkl API: non-ok HTTP
 * responses, network rejections (fetch threw), and response-body parse errors.
 *
 * - HTTP failures populate `status` and `statusText`.
 * - Network and parse failures leave `status`/`statusText` undefined and
 *   carry the original error via `cause`.
 */
export class MerklApiError extends Error {
  readonly status: number | undefined;
  readonly statusText: string | undefined;
  readonly url: string;
  readonly chainId: number;

  constructor(params: {
    message: string;
    url: string;
    chainId: number;
    status?: number | undefined;
    statusText?: string | undefined;
    cause?: unknown;
  }) {
    super(
      params.message,
      params.cause !== undefined ? { cause: params.cause } : undefined,
    );
    this.name = "MerklApiError";
    this.url = params.url;
    this.chainId = params.chainId;
    this.status = params.status;
    this.statusText = params.statusText;
  }
}

export async function getUserMorphoRewardsData(params: {
  environment: Environment;
  account: `0x${string}`;
  throwOnExternalApiError?: boolean;
}): Promise<MorphoUserReward[]> {
  // The Morpho URD distributions endpoint (rewards.morpho.org) was
  // deprecated and now 301-redirects to a SPA, so JSON parsing fails.
  // Surface only Merkl rewards.
  const merklRewards = await getMerklRewardsData(
    params.environment,
    params.account,
    { throwOnError: params.throwOnExternalApiError ?? false },
  );

  const isFullDeployment =
    params.environment.custom.morpho?.minimalDeployment === false;

  // For full deployments (Base), restrict to Moonwell vault campaigns so the
  // result excludes staking and other Moonwell campaigns; those are returned
  // by their own actions (e.g. getUserStakingInfo). On other chains, surface
  // every Merkl reward we get back.
  const vaultCampaignIds = isFullDeployment
    ? new Set<string>(
        (Object.values(publicEnvironments) as Environment[]).flatMap(
          (environment) =>
            Object.values(environment.config.vaults ?? {})
              .map((vault) => vault.campaignId)
              .filter((id): id is string => id !== undefined),
        ),
      )
    : null;

  const sumBreakdowns = (
    breakdowns: {
      campaignId: string;
      amount: string;
      claimed: string;
      pending: string;
    }[],
    field: "amount" | "claimed" | "pending",
  ): bigint =>
    breakdowns.reduce(
      (acc, curr) =>
        vaultCampaignIds === null || vaultCampaignIds.has(curr.campaignId)
          ? acc + BigInt(curr[field])
          : acc,
      0n,
    );

  const merklResult: MorphoUserReward[] = [];

  for (const chainData of merklRewards) {
    for (const reward of chainData.rewards) {
      const rewardToken: TokenConfig = {
        address: reward.token.address as Address,
        decimals: reward.token.decimals,
        symbol: reward.token.symbol,
        name: reward.token.symbol,
      };

      const amount = vaultCampaignIds
        ? sumBreakdowns(reward.breakdowns, "amount")
        : BigInt(reward.amount);
      const claimed = vaultCampaignIds
        ? sumBreakdowns(reward.breakdowns, "claimed")
        : BigInt(reward.claimed);
      const pending = vaultCampaignIds
        ? sumBreakdowns(reward.breakdowns, "pending")
        : BigInt(reward.pending);

      const claimableNow = new Amount(amount - claimed, rewardToken.decimals);
      const claimableNowUsd = claimableNow.value * (reward.token.price ?? 0);
      const claimableFuture = new Amount(pending, rewardToken.decimals);
      const claimableFutureUsd =
        claimableFuture.value * (reward.token.price ?? 0);

      merklResult.push({
        type: "merkl-reward",
        chainId: chainData.chain.id,
        account: params.account,
        rewardToken,
        claimableNow,
        claimableNowUsd,
        claimableFuture,
        claimableFutureUsd,
      });
    }
  }

  return merklResult;
}

export async function getUserMorphoStakingRewardsData(params: {
  environment: Environment;
  account: `0x${string}`;
}): Promise<MorphoUserStakingReward[]> {
  const vaultsWithStaking = Object.values(
    params.environment.config.vaults,
  ).filter((vault) => Boolean(vault.multiReward));

  if (!vaultsWithStaking.length) {
    return [];
  }

  // Hoist shared contract reads outside the per-vault loop
  const homeEnvironment =
    (Object.values(publicEnvironments) as Environment[]).find((e) =>
      e.custom?.governance?.chainIds?.includes(params.environment.chainId),
    ) || params.environment;

  const viewsContract = params.environment.contracts.views;
  const homeViewsContract = homeEnvironment.contracts.views;

  const [allMarkets, nativeTokenPriceRaw, governanceTokenPriceRaw] =
    await Promise.all([
      viewsContract?.read.getAllMarketsInfo(),
      homeViewsContract?.read.getNativeTokenPrice(),
      getGovernanceTokenPriceFor(params.environment).catch((err) => {
        params.environment.onError?.(err, {
          source: "governance-token-price",
          chainId: params.environment.chainId,
        });
        return 0n;
      }),
    ]);

  const governanceTokenPrice = new Amount(governanceTokenPriceRaw, 18);
  const nativeTokenPrice = new Amount(nativeTokenPriceRaw ?? 0n, 18);

  let tokenPrices =
    allMarkets
      ?.map((marketInfo) => {
        const marketFound = findMarketByAddress(
          params.environment,
          marketInfo.market,
        );
        if (marketFound) {
          return {
            token: marketFound.underlyingToken,
            tokenPrice: new Amount(
              marketInfo.underlyingPrice,
              36 - marketFound.underlyingToken.decimals,
            ),
          };
        } else {
          return;
        }
      })
      .filter((token) => !!token) || [];

  // Add governance token to token prices
  if (params.environment.custom?.governance?.token) {
    tokenPrices = [
      ...tokenPrices,
      {
        token:
          params.environment.config.tokens[
            params.environment.custom.governance.token
          ]!,
        tokenPrice: governanceTokenPrice,
      },
    ];
  }

  // Add native token to token prices
  tokenPrices = [
    ...tokenPrices,
    {
      token: findTokenByAddress(params.environment, zeroAddress)!,
      tokenPrice: nativeTokenPrice,
    },
  ];

  const rewards = await Promise.all(
    vaultsWithStaking.map(async (vault) => {
      if (!vault.multiReward) return [];

      const vaultRewards = await getRewardsEarnedData(
        params.environment,
        params.account,
        vault.multiReward,
      );

      return vaultRewards
        .filter((reward): reward is { amount: Amount; token: TokenConfig } => {
          return reward !== undefined && reward.amount.value > 0;
        })
        .map((reward) => {
          const market = tokenPrices.find(
            (m) => m?.token.address === reward.token.address,
          );
          const priceUsd = market?.tokenPrice.value ?? 0;

          return {
            ...reward,
            chainId: params.environment.chainId,
            amountUsd: reward.amount.value * priceUsd,
          };
        });
    }),
  );

  return rewards.flat();
}

const getRewardsEarnedData = async (
  environment: Environment,
  userAddress: Address,
  multiRewardsAddress: Address,
) => {
  if (!environment.custom.multiRewarder) {
    return [];
  }

  const multiRewardAbi = parseAbi([
    "function earned(address account, address token) view returns (uint256)",
  ]);

  const multiRewardContract = getContract({
    address: multiRewardsAddress,
    abi: multiRewardAbi,
    client: environment.publicClient,
  });

  const rewards = await Promise.all(
    environment.custom.multiRewarder.map(async (multiRewarder) => {
      const token = environment.config.tokens[multiRewarder.rewardToken];

      if (!token) {
        return;
      }

      try {
        const earned = await multiRewardContract.read.earned([
          userAddress,
          token.address,
        ]);
        return { amount: new Amount(BigInt(earned), token.decimals), token };
      } catch {
        return { amount: new Amount(0n, token.decimals), token };
      }
    }),
  );

  return rewards.filter(Boolean);
};

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

async function getMerklRewardsData(
  environment: Environment,
  account: Address,
  options: { throwOnError: boolean } = { throwOnError: false },
): Promise<MerklRewardsResponse[]> {
  const url = `${getMerklProxyBaseUrl(environment.lunarIndexerUrl)}/users/${account}/rewards?chainId=${environment.chainId}&test=false&breakdownPage=0&reloadChainId=${environment.chainId}`;

  let response: Response;
  try {
    // Merkl campaigns always distribute rewards on the same chain as the
    // opportunity, so environment.chainId is the only chain we need to query.
    // The previous two-phase approach (fetch opportunities per vault → extract
    // chain IDs → fetch rewards per chain) made N+1 HTTP calls to discover
    // a chain ID we already know.
    response = await fetch(url, { headers: MOONWELL_FETCH_JSON_HEADERS });
  } catch (error) {
    if (options.throwOnError) {
      throw new MerklApiError({
        message: `Merkl API network error for chain ${environment.chainId}`,
        url,
        chainId: environment.chainId,
        cause: error,
      });
    }
    console.error(
      `[getMerklRewardsData:network] chain=${environment.chainId} url=${url}`,
      error,
    );
    return [];
  }

  if (!response.ok) {
    const message = `Merkl API request failed for chain ${environment.chainId}: ${response.status} ${response.statusText}`;
    if (options.throwOnError) {
      throw new MerklApiError({
        message,
        url,
        chainId: environment.chainId,
        status: response.status,
        statusText: response.statusText,
      });
    }
    console.warn(`${message} (url=${url})`);
    return [];
  }

  try {
    return (await response.json()) as MerklRewardsResponse[];
  } catch (error) {
    if (options.throwOnError) {
      throw new MerklApiError({
        message: `Merkl API response parse error for chain ${environment.chainId}`,
        url,
        chainId: environment.chainId,
        cause: error,
      });
    }
    console.error(
      `[getMerklRewardsData:parse] chain=${environment.chainId} url=${url}`,
      error,
    );
    return [];
  }
}
