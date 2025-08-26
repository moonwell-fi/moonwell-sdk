import lodash from "lodash";
const { uniq } = lodash;
import { type Address, getContract, parseAbi, zeroAddress } from "viem";
import { Amount } from "../../../common/amount.js";
import { MOONWELL_FETCH_JSON_HEADERS } from "../../../common/fetch-headers.js";
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
import { getGraphQL } from "../utils/graphql.js";

export async function getUserMorphoRewardsData(params: {
  environment: Environment;
  account: `0x${string}`;
}): Promise<MorphoUserReward[]> {
  const merklRewards = await getMerklRewardsData(
    params.environment,
    params.account,
  );

  if (params.environment.custom.morpho?.minimalDeployment === false) {
    const morphoRewards = await getMorphoRewardsData(
      params.environment.chainId,
      params.account,
    );
    // Process Morpho rewards
    const morphoAssets = await getMorphoAssetsData(
      morphoRewards.map((r) => r.asset.address),
    );

    const morphoResult: (MorphoUserReward | undefined)[] = morphoRewards.map(
      (r) => {
        const asset = morphoAssets.find(
          (a) => a.address.toLowerCase() === r.asset.address.toLowerCase(),
        );

        if (!asset) {
          return undefined;
        }

        const rewardToken: TokenConfig = {
          address: asset.address,
          decimals: asset.decimals,
          symbol: asset.symbol,
          name: asset.name,
        };

        switch (r.type) {
          case "uniform-reward": {
            const claimableNow = new Amount(
              BigInt(r.amount?.claimable_now || 0),
              rewardToken.decimals,
            );
            const claimableNowUsd = claimableNow.value * (asset.priceUsd || 0);
            const claimableFuture = new Amount(
              BigInt(r.amount?.claimable_next || 0),
              rewardToken.decimals,
            );
            const claimableFutureUsd =
              claimableFuture.value * (asset.priceUsd || 0);

            const uniformReward: MorphoUserReward = {
              type: "uniform-reward",
              chainId: r.asset.chain_id,
              account: r.user,
              rewardToken,
              claimableNow,
              claimableNowUsd,
              claimableFuture,
              claimableFutureUsd,
            };
            return uniformReward;
          }

          case "market-reward": {
            const claimableNow = new Amount(
              BigInt(r.for_supply?.claimable_now || 0),
              rewardToken.decimals,
            );
            const claimableNowUsd = claimableNow.value * (asset.priceUsd || 0);

            const claimableFuture = new Amount(
              BigInt(r.for_supply?.claimable_next || 0),
              rewardToken.decimals,
            );
            const claimableFutureUsd =
              claimableFuture.value * (asset.priceUsd || 0);

            const collateralClaimableNow = new Amount(
              BigInt(r.for_collateral?.claimable_now || 0),
              rewardToken.decimals,
            );
            const collateralClaimableNowUsd =
              collateralClaimableNow.value * (asset.priceUsd || 0);
            const collateralClaimableFuture = new Amount(
              BigInt(r.for_collateral?.claimable_next || 0),
              rewardToken.decimals,
            );
            const collateralClaimableFutureUsd =
              collateralClaimableFuture.value * (asset.priceUsd || 0);

            const borrowClaimableNow = new Amount(
              BigInt(r.for_borrow?.claimable_now || 0),
              rewardToken.decimals,
            );
            const borrowClaimableNowUsd =
              borrowClaimableNow.value * (asset.priceUsd || 0);
            const borrowClaimableFuture = new Amount(
              BigInt(r.for_borrow?.claimable_next || 0),
              rewardToken.decimals,
            );
            const borrowClaimableFutureUsd =
              borrowClaimableFuture.value * (asset.priceUsd || 0);

            //Rewards reallocated to vaults are reported as vault rewards
            if (r.reallocated_from) {
              const vaultReward: MorphoUserReward = {
                type: "vault-reward",
                chainId: r.program.chain_id,
                account: r.user,
                vaultId: r.reallocated_from,
                rewardToken,
                claimableNow,
                claimableNowUsd,
                claimableFuture,
                claimableFutureUsd,
              };
              return vaultReward;
            } else {
              const marketReward: MorphoUserReward = {
                type: "market-reward",
                chainId: r.program.chain_id,
                account: r.user,
                marketId: r.program.market_id || "",
                rewardToken,
                collateralRewards: {
                  claimableNow: collateralClaimableNow,
                  claimableNowUsd: collateralClaimableNowUsd,
                  claimableFuture: collateralClaimableFuture,
                  claimableFutureUsd: collateralClaimableFutureUsd,
                },
                borrowRewards: {
                  claimableNow: borrowClaimableNow,
                  claimableNowUsd: borrowClaimableNowUsd,
                  claimableFuture: borrowClaimableFuture,
                  claimableFutureUsd: borrowClaimableFutureUsd,
                },
              };
              return marketReward;
            }
          }
          case "vault-reward": {
            const claimableNow = new Amount(
              BigInt(r.for_supply?.claimable_now || 0),
              rewardToken.decimals,
            );
            const claimableNowUsd = claimableNow.value * (asset.priceUsd || 0);
            const claimableFuture = new Amount(
              BigInt(r.for_supply?.claimable_next || 0),
              rewardToken.decimals,
            );
            const claimableFutureUsd =
              claimableFuture.value * (asset.priceUsd || 0);

            const vaultReward: MorphoUserReward = {
              type: "vault-reward",
              chainId: r.program.chain_id,
              account: r.user,
              vaultId: r.program.vault,
              rewardToken,
              claimableNow,
              claimableNowUsd,
              claimableFuture,
              claimableFutureUsd,
            };

            return vaultReward;
          }
        }
      },
    );

    // Process Merkl rewards
    const merklResult: MorphoUserReward[] = [];

    for (const chainData of merklRewards) {
      for (const reward of chainData.rewards) {
        // Try to find token info in morphoAssets first
        const morphoAsset = morphoAssets.find(
          (a) => a.address.toLowerCase() === reward.token.address.toLowerCase(),
        );

        const rewardToken: TokenConfig = {
          address: reward.token.address as Address,
          decimals: morphoAsset?.decimals ?? reward.token.decimals,
          symbol: morphoAsset?.symbol ?? reward.token.symbol,
          name: morphoAsset?.name ?? reward.token.symbol,
        };

        const getVaultRewardAmount = (
          breakdowns: any[],
          field: "amount" | "claimed" | "pending",
        ) => {
          return breakdowns.reduce((acc, curr) => {
            // Check if campaign exists in vaults across all chains
            const isVaultCampaign = Object.values(publicEnvironments).some(
              (environment) => {
                // Check if environment has vaults
                if (
                  environment.config.vaults &&
                  Object.keys(environment.config.vaults).length > 0
                ) {
                  return Object.values(environment.config.vaults).some(
                    (vault) => vault.campaignId === curr.campaignId,
                  );
                }
                return false;
              },
            );
            return isVaultCampaign ? acc + BigInt(curr[field]) : acc;
          }, 0n);
        };

        const amount = getVaultRewardAmount(reward.breakdowns, "amount");
        const claimed = getVaultRewardAmount(reward.breakdowns, "claimed");
        const pending = getVaultRewardAmount(reward.breakdowns, "pending");

        const claimableNow = new Amount(amount - claimed, rewardToken.decimals);
        const claimableNowUsd =
          claimableNow.value *
          (morphoAsset?.priceUsd ?? reward.token.price ?? 0);
        const claimableFuture = new Amount(pending, rewardToken.decimals);
        const claimableFutureUsd =
          claimableFuture.value *
          (morphoAsset?.priceUsd ?? reward.token.price ?? 0);

        const merklReward: MorphoUserReward = {
          type: "merkl-reward",
          chainId: chainData.chain.id,
          account: params.account,
          rewardToken,
          claimableNow,
          claimableNowUsd,
          claimableFuture,
          claimableFutureUsd,
        };

        merklResult.push(merklReward);
      }
    }

    // Combine both results
    const allResults = [
      ...(morphoResult.filter((r) => r !== undefined) as MorphoUserReward[]),
      ...merklResult,
    ];

    return allResults;
  }

  const merklResult: MorphoUserReward[] = [];

  for (const chainData of merklRewards) {
    for (const reward of chainData.rewards) {
      const rewardToken: TokenConfig = {
        address: reward.token.address as Address,
        decimals: reward.token.decimals,
        symbol: reward.token.symbol,
        name: reward.token.symbol,
      };

      const claimableNow = new Amount(
        BigInt(reward.amount) - BigInt(reward.claimed),
        rewardToken.decimals,
      );
      const claimableNowUsd = claimableNow.value * (reward.token.price ?? 0);
      const claimableFuture = new Amount(
        BigInt(reward.pending),
        rewardToken.decimals,
      );
      const claimableFutureUsd =
        claimableFuture.value * (reward.token.price ?? 0);

      const merklReward: MorphoUserReward = {
        type: "merkl-reward",
        chainId: chainData.chain.id,
        account: params.account,
        rewardToken,
        claimableNow,
        claimableNowUsd,
        claimableFuture,
        claimableFutureUsd,
      };

      merklResult.push(merklReward);
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

  const rewards = await Promise.all(
    vaultsWithStaking.map(async (vault) => {
      if (!vault.multiReward) return [];

      const vaultRewards = await getRewardsEarnedData(
        params.environment,
        params.account,
        vault.multiReward,
      );

      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(params.environment.chainId),
        ) || params.environment;

      const viewsContract = params.environment.contracts.views;
      const homeViewsContract = homeEnvironment.contracts.views;

      const userData = await Promise.all([
        viewsContract?.read.getAllMarketsInfo(),
        homeViewsContract?.read.getNativeTokenPrice(),
        homeViewsContract?.read.getGovernanceTokenPrice(),
      ]);

      const [allMarkets, nativeTokenPriceRaw, governanceTokenPriceRaw] =
        userData;

      const governanceTokenPrice = new Amount(
        governanceTokenPriceRaw || 0n,
        18,
      );
      const nativeTokenPrice = new Amount(nativeTokenPriceRaw || 0n, 18);

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

type MorphoRewardsResponse = {
  user: Address;
  for_borrow: {
    claimable_next: string;
    claimable_now: string;
    claimed: string;
    total: string;
  };
  for_collateral: {
    claimable_next: string;
    claimable_now: string;
    claimed: string;
    total: string;
  };
  for_supply: {
    claimable_next: string;
    claimable_now: string;
    claimed: string;
    total: string;
  };
  program: {
    asset: { address: Address };
    market_id?: string;
    chain_id: number;
    vault: Address;
  };
  asset: { address: Address; chain_id: number };
  amount?: { claimable_next: string; claimable_now: string };
  type: "vault-reward" | "market-reward" | "uniform-reward";
  reallocated_from: Address;
};

type MorphoAssetResponse = {
  address: Address;
  symbol: string;
  priceUsd: number | undefined;
  name: string;
  decimals: number;
};

async function getMorphoRewardsData(
  chainId: number,
  account: Address,
): Promise<MorphoRewardsResponse[]> {
  const rewardsRequest = await fetch(
    `https://rewards.morpho.org/v1/users/${account}/rewards?chain_id=${chainId}&trusted=true&exclude_merkl_programs=true`,
    {
      headers: MOONWELL_FETCH_JSON_HEADERS,
    },
  );
  const rewards = await rewardsRequest.json();
  return (rewards.data || []) as MorphoRewardsResponse[];
}

async function getMorphoAssetsData(
  addresses: Address[],
): Promise<MorphoAssetResponse[]> {
  const rewardsRequest = await getGraphQL<{
    assets: {
      items: MorphoAssetResponse[];
    };
  }>(`
    query {
      assets(where: { address_in:[${uniq(addresses)
        .map((a: string) => `"${a.toLowerCase()}"`)
        .join(",")}]}) {
        items {
          address     
          symbol
          priceUsd
          name
          decimals
        }
      }
    }
  `);
  if (rewardsRequest) {
    return rewardsRequest.assets.items;
  }
  return [];
}

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

// Types for Merkl Opportunities API
type MerklToken = {
  id: string;
  name: string;
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  displaySymbol: string;
  icon: string;
  verified: boolean;
  isTest: boolean;
  type: string;
  isNative: boolean;
  price: number;
};

type MerklRewardBreakdown = {
  token: MerklToken;
  amount: string;
  value: number;
  distributionType: string;
  id: string;
  timestamp: string;
  campaignId: string;
  dailyRewardsRecordId: string;
};

type MerklOpportunity = {
  chainId: number;
  type: string;
  identifier: string;
  name: string;
  description: string;
  howToSteps: string[];
  status: string;
  action: string;
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: any[];
  id: string;
  depositUrl: string;
  explorerAddress: string;
  lastCampaignCreatedAt: number;
  aprRecord: {
    cumulated: number;
    timestamp: string;
    breakdowns: {
      distributionType: string;
      identifier: string;
      type: string;
      value: number;
      timestamp: string;
    }[];
  };
  rewardsRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: MerklRewardBreakdown[];
  };
};

async function getMerklRewardsData(
  environment: Environment,
  account: Address,
): Promise<MerklRewardsResponse[]> {
  try {
    // Get unique chain IDs from vault opportunities
    const chainIdsPromises = Object.values(environment.config.vaults).map(
      async (vault) => {
        try {
          const response = await fetch(
            `https://api.merkl.xyz/v4/opportunities?identifier=${environment.config.tokens[vault.vaultToken]?.address}&chainId=${environment.chainId}&status=LIVE`,
            {
              headers: MOONWELL_FETCH_JSON_HEADERS,
            },
          );

          if (!response.ok) {
            console.warn(
              `Failed to fetch opportunities: ${response.status} ${response.statusText}`,
            );
            return [];
          }

          const data: MerklOpportunity[] = await response.json();
          return data.flatMap((opportunity) =>
            opportunity.rewardsRecord.breakdowns.map(
              (breakdown) => breakdown.token.chainId,
            ),
          );
        } catch (error) {
          console.warn(
            `Error fetching opportunities for vault ${vault.vaultToken}:`,
            error,
          );
          return [];
        }
      },
    );

    const chainIds = [...new Set((await Promise.all(chainIdsPromises)).flat())];

    // Fetch rewards for each unique chain ID
    const rewardsPromises = chainIds.map(async (chainId) => {
      try {
        const response = await fetch(
          `https://api.merkl.xyz/v4/users/${account}/rewards?chainId=${chainId}&test=false&breakdownPage=0&reloadChainId=${chainId}`,
          {
            headers: MOONWELL_FETCH_JSON_HEADERS,
          },
        );

        if (!response.ok) {
          console.warn(
            `Merkl API request failed: ${response.status} ${response.statusText}`,
          );
          return [];
        }

        return (await response.json()) as MerklRewardsResponse[];
      } catch (error) {
        console.warn(
          `Error fetching Merkl rewards for chain ${chainId}:`,
          error,
        );
        return [];
      }
    });

    const allRewards = await Promise.all(rewardsPromises);
    return allRewards.flat();
  } catch (error) {
    console.error("Error in getMerklRewardsData:", error);
    return [];
  }
}
