import axios from "axios";
import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type {
  MorphoMarket,
  PublicAllocatorSharedLiquidityType,
} from "../../../types/morphoMarket.js";
import type { MorphoReward } from "../../../types/morphoReward.js";
import { shouldFallback } from "../../lunar-indexer-client.js";
import { getGraphQL } from "../utils/graphql.js";
import {
  type GetMorphoMarketsRewardsReturnType as LunarIndexerRewardsType,
  fetchMarketsFromIndexer,
  transformMarketsFromIndexer,
} from "./lunarIndexerTransform.js";

export interface LunarVaultMarket {
  marketId: string;
  flowCapIn: string;
  flowCapOut: string;
  supplyCap: string;
  supplyCapEnabled: boolean;
  vaultSupplyShares: string;
  vaultSupplyAssets: string;
}

export interface LunarVault {
  address: string;
  name: string;
  fee: string;
  markets: LunarVaultMarket[];
}

export interface LunarMarketLiveData {
  totalSupplyAssets?: string;
  totalBorrowAssets?: string;
  totalLiquidity?: string;
  loanToken?: { address: string; decimals: number };
  collateralToken?: { address: string; decimals: number };
}

export interface LunarSharedLiquidityResponse {
  vaults: LunarVault[];
  markets: Record<string, LunarMarketLiveData>;
}

async function fetchSharedLiquidityFromLunar(
  lunarIndexerUrl: string,
  chainId: number,
): Promise<LunarSharedLiquidityResponse> {
  const response = await axios.get<LunarSharedLiquidityResponse>(
    `${lunarIndexerUrl}/api/v1/isolated/shared-liquidity/${chainId}`,
  );
  return response.data;
}

export function computeSharedLiquidityFromLunar(
  data: LunarSharedLiquidityResponse,
  targetMarkets: string[],
  marketParamsMap: Map<
    string,
    {
      oracle: string;
      irm: string;
      lltv: string;
      loanToken: { address: string; decimals: number };
      collateralToken: { address: string; decimals: number };
    }
  >,
  chainId: number,
): GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[] {
  return targetMarkets.map((targetMarket) => {
    const targetId = targetMarket.toLowerCase();
    const r: PublicAllocatorSharedLiquidityType[] = [];
    let reallocatableLiquidityAssets = 0;
    const marketRemainingLiquidity: Record<string, number> = {};

    const targetLiveData = data.markets[targetId];
    const targetParams = marketParamsMap.get(targetId);

    // Vault values (flowCapIn, flowCapOut, vaultSupplyAssets, supplyCap) are raw
    // (wei-like). Markets data (totalSupplyAssets, totalBorrowAssets, totalLiquidity)
    // is already in token units (divided by decimals). We convert vault raw values
    // to token units using the loan token decimals before comparing.
    const targetLoanDecimals =
      targetLiveData?.loanToken?.decimals ??
      targetParams?.loanToken.decimals ??
      18;
    const targetScale = 10 ** targetLoanDecimals;

    for (const vault of data.vaults) {
      const thisMarketInVault = vault.markets.find(
        (m) => m.marketId.toLowerCase() === targetId,
      );
      if (!thisMarketInVault) continue;

      const vaultSupplyInTarget =
        Number(thisMarketInVault.vaultSupplyAssets) / targetScale;
      if (vaultSupplyInTarget <= 0) continue;

      let maxIn = Number(thisMarketInVault.flowCapIn) / targetScale;
      if (thisMarketInVault.supplyCapEnabled) {
        const remainingCap =
          Number(thisMarketInVault.supplyCap) / targetScale -
          vaultSupplyInTarget;
        maxIn = Math.min(maxIn, remainingCap);
      }
      if (maxIn <= 0) continue;

      const flowCaps = vault.markets.map((m) => ({
        maxIn: Number(m.flowCapIn),
        maxOut: Number(m.flowCapOut),
        market: { uniqueKey: m.marketId },
      }));

      const vaultConfig = {
        address: vault.address,
        name: vault.name,
        publicAllocatorConfig: {
          fee: Number(vault.fee),
          flowCaps,
        },
      };

      const otherMarketsLiquidity: {
        marketId: string;
        amount: number;
        liquidity: number;
        allocationMarket: PublicAllocatorSharedLiquidityType["allocationMarket"];
      }[] = [];

      for (const sourceMarket of vault.markets) {
        if (sourceMarket.marketId.toLowerCase() === targetId) continue;

        const sourceLiveData =
          data.markets[sourceMarket.marketId.toLowerCase()];
        if (!sourceLiveData) continue;

        const sourceLoanDecimals =
          sourceLiveData.loanToken?.decimals ??
          marketParamsMap.get(sourceMarket.marketId.toLowerCase())?.loanToken
            .decimals ??
          18;
        const sourceScale = 10 ** sourceLoanDecimals;

        const vaultSupplyInSource =
          Number(sourceMarket.vaultSupplyAssets) / sourceScale;
        const maxOut = Number(sourceMarket.flowCapOut) / sourceScale;

        // Use pre-computed totalLiquidity if available, else derive from supply/borrow
        const liquidity = sourceLiveData.totalLiquidity
          ? Number(sourceLiveData.totalLiquidity)
          : Number(sourceLiveData.totalSupplyAssets ?? 0) -
            Number(sourceLiveData.totalBorrowAssets ?? 0);

        if (vaultSupplyInSource > 0 && maxOut > 0 && liquidity > 0) {
          const sourceParams = marketParamsMap.get(
            sourceMarket.marketId.toLowerCase(),
          );
          const allocationMarket: PublicAllocatorSharedLiquidityType["allocationMarket"] =
            sourceParams
              ? {
                  uniqueKey: sourceMarket.marketId,
                  loanAsset: { address: sourceParams.loanToken.address },
                  collateralAsset: {
                    address: sourceParams.collateralToken.address,
                  },
                  oracleAddress: sourceParams.oracle,
                  irmAddress: sourceParams.irm,
                  lltv: sourceParams.lltv,
                }
              : undefined;

          otherMarketsLiquidity.push({
            marketId: sourceMarket.marketId.toLowerCase(),
            amount: Math.min(liquidity, vaultSupplyInSource, maxOut),
            liquidity,
            allocationMarket,
          });
        }
      }

      for (const source of otherMarketsLiquidity
        .filter((s) => s.amount > 0)
        .sort((a, b) => b.amount - a.amount)) {
        const marketLiquidity =
          marketRemainingLiquidity[source.marketId] ?? source.liquidity;
        if (maxIn > 0 && marketLiquidity > 0) {
          const assets = Math.min(marketLiquidity, source.amount, maxIn);
          maxIn -= assets;
          marketRemainingLiquidity[source.marketId] = marketLiquidity - assets;
          reallocatableLiquidityAssets += assets;
          r.push({
            assets,
            vault: vaultConfig,
            ...(source.allocationMarket
              ? { allocationMarket: source.allocationMarket }
              : {}),
          });
        }
      }
    }

    // reallocatableLiquidityAssets is in token units; Amount expects raw units
    return {
      chainId,
      marketId: targetId,
      reallocatableLiquidityAssets: new Amount(
        BigInt(Math.round(reallocatableLiquidityAssets * targetScale)),
        targetLoanDecimals,
      ),
      publicAllocatorSharedLiquidity: r,
    };
  });
}

export async function getMorphoMarketsData(params: {
  environments: Environment[];
  markets?: string[] | undefined;
  includeRewards?: boolean | undefined;
}): Promise<MorphoMarket[]> {
  const { environments } = params;

  const hasLunarIndexer = environments.some((env) => env.lunarIndexerUrl);

  // Use Lunar Indexer implementation if available (with automatic fallback to on-chain on failure)
  if (hasLunarIndexer) {
    return getMorphoMarketsDataFromIndexer(params);
  }

  // Fall back to on-chain contract queries (legacy implementation)
  return getMorphoMarketsDataFromOnChain(params);
}

/**
 * Fetch markets from on-chain contracts (original implementation)
 */
async function getMorphoMarketsDataFromOnChain(params: {
  environments: Environment[];
  markets?: string[] | undefined;
  includeRewards?: boolean | undefined;
}): Promise<MorphoMarket[]> {
  const { environments } = params;

  const environmentsWithMarkets = environments.filter(
    (environment) =>
      Object.keys(environment.config.morphoMarkets).length > 0 &&
      environment.contracts.morphoViews,
  );

  if (environmentsWithMarkets.length === 0) {
    return [];
  }

  const marketInfoSettlements = await Promise.allSettled(
    environmentsWithMarkets.map((environment) => {
      const marketsIds = Object.values(environment.config.morphoMarkets)
        .map((item) => item.id as Address)
        .filter((id) =>
          params.markets
            ? params.markets
                .map((id) => id.toLowerCase())
                .includes(id.toLowerCase())
            : true,
        );

      try {
        return environment.contracts.morphoViews!.read.getMorphoBlueMarketsInfo(
          [marketsIds],
        );
      } catch (error) {
        return Promise.reject(error);
      }
    }),
  );

  const fulfilledMarketsInfo = marketInfoSettlements.flatMap((s, i) =>
    s.status === "fulfilled"
      ? [{ environment: environmentsWithMarkets[i]!, marketsInfo: s.value }]
      : [],
  );

  const initialMarkets: MorphoMarket[] = [];
  fulfilledMarketsInfo.forEach(({ environment, marketsInfo }) => {
    marketsInfo.forEach((marketInfo) => {
      const marketKey = Object.keys(environment.config.morphoMarkets).find(
        (item) =>
          environment.config.morphoMarkets[item].id.toLowerCase() ===
          marketInfo.marketId.toLowerCase(),
      );

      if (!marketKey) {
        return;
      }

      initialMarkets.push({
        chainId: environment.chainId,
        marketId: marketInfo.marketId,
        marketKey,
      } as MorphoMarket);
    });
  });

  const rewardEnvironment =
    params.environments.find((env) => env.custom?.morpho?.apiUrl) ??
    params.environments[0];
  const rewardsData = await getMorphoMarketRewards(
    rewardEnvironment,
    initialMarkets,
  );
  const rewardsDataByChainAndMarket = new Map<
    string,
    GetMorphoMarketsRewardsReturnType
  >();
  rewardsData.forEach((reward) => {
    const key = `${reward.chainId}-${reward.marketId.toLowerCase()}`;
    rewardsDataByChainAndMarket.set(key, reward);
  });

  const result = fulfilledMarketsInfo.reduce(
    (aggregator, { environment, marketsInfo }) => {
      const markets = marketsInfo.flatMap((marketInfo) => {
        const marketKey = Object.keys(environment.config.morphoMarkets).find(
          (item) =>
            environment.config.morphoMarkets[item].id.toLowerCase() ===
            marketInfo.marketId.toLowerCase(),
        );

        if (!marketKey) {
          return [];
        }

        const marketConfig = Object.values(
          environment.config.morphoMarkets,
        ).find(
          (item) => item.id.toLowerCase() === marketInfo.marketId.toLowerCase(),
        )!;
        const loanToken = environment.config.tokens[marketConfig.loanToken];
        const collateralToken =
          environment.config.tokens[marketConfig.collateralToken];

        const oraclePrice = new Amount(
          BigInt(marketInfo.oraclePrice),
          36 + loanToken.decimals - collateralToken.decimals,
        ).value;

        let collateralTokenPrice = new Amount(marketInfo.collateralPrice, 18)
          .value;
        let loanTokenPrice = new Amount(marketInfo.loanPrice, 18).value;

        if (collateralTokenPrice === 0 && loanTokenPrice > 0) {
          collateralTokenPrice = loanTokenPrice * oraclePrice;
        }

        if (loanTokenPrice === 0 && collateralTokenPrice > 0) {
          loanTokenPrice = collateralTokenPrice / oraclePrice;
        }

        // stkWELL is 1:1 with WELL, so use WELL price for stkWELL
        if (collateralToken.symbol === "stkWELL") {
          const wellMarketInfo = marketsInfo.find((mi) => {
            const wellMarketConfig = Object.values(
              environment.config.morphoMarkets,
            ).find(
              (item) =>
                item.id.toLowerCase() === mi.marketId.toLowerCase() &&
                (item.collateralToken === "WELL" || item.loanToken === "WELL"),
            );
            return wellMarketConfig !== undefined;
          });

          if (wellMarketInfo) {
            const wellMarketConfig = Object.values(
              environment.config.morphoMarkets,
            ).find(
              (item) =>
                item.id.toLowerCase() === wellMarketInfo.marketId.toLowerCase(),
            );

            let wellPrice = 0;
            if (
              wellMarketConfig &&
              wellMarketConfig.collateralToken === "WELL"
            ) {
              wellPrice = new Amount(wellMarketInfo.collateralPrice, 18).value;

              if (wellPrice === 0) {
                const wellLoanToken =
                  environment.config.tokens[wellMarketConfig.loanToken];
                const wellLoanPrice = new Amount(wellMarketInfo.loanPrice, 18)
                  .value;
                const wellOraclePrice = new Amount(
                  BigInt(wellMarketInfo.oraclePrice),
                  36 + wellLoanToken.decimals - 18, // WELL has 18 decimals
                ).value;
                wellPrice = wellLoanPrice * wellOraclePrice;
              }
            } else if (
              wellMarketConfig &&
              wellMarketConfig.loanToken === "WELL"
            ) {
              wellPrice = new Amount(wellMarketInfo.loanPrice, 18).value;

              if (wellPrice === 0) {
                const wellCollateralToken =
                  environment.config.tokens[wellMarketConfig.collateralToken];
                const wellCollateralPrice = new Amount(
                  wellMarketInfo.collateralPrice,
                  18,
                ).value;
                const wellOraclePrice = new Amount(
                  BigInt(wellMarketInfo.oraclePrice),
                  36 + 18 - wellCollateralToken.decimals,
                ).value;
                wellPrice = wellCollateralPrice / wellOraclePrice;
              }
            }

            if (wellPrice > 0) {
              collateralTokenPrice = wellPrice;
            }
          }
        }

        const performanceFee = new Amount(marketInfo.fee, 18).value;
        const loanToValue = new Amount(marketInfo.lltv, 18).value;

        const totalSupplyInLoanToken = new Amount(
          BigInt(marketInfo.totalSupplyAssets),
          loanToken.decimals,
        );

        const totalSupply = new Amount(
          Number(totalSupplyInLoanToken.value / oraclePrice),
          collateralToken.decimals,
        );

        const totalBorrows = new Amount(
          marketInfo.totalBorrowAssets,
          loanToken.decimals,
        );

        // Supply APR is used only for vaults, zeroing it for now to avoid confusion
        // const supplyApy = new Amount(marketInfo.supplyApy, 18).value * 100;
        const borrowApy = new Amount(marketInfo.borrowApy, 18).value * 100;

        const availableLiquidity = new Amount(
          marketInfo.totalSupplyAssets - marketInfo.totalBorrowAssets,
          loanToken.decimals,
        );
        const availableLiquidityUsd = availableLiquidity.value * loanTokenPrice;

        const rewardKey = `${environment.chainId}-${marketInfo.marketId.toLowerCase()}`;
        const marketRewardData = rewardsDataByChainAndMarket.get(rewardKey);

        const mapping: MorphoMarket = {
          chainId: environment.chainId,
          marketId: marketInfo.marketId,
          marketKey,
          deprecated: marketConfig.deprecated === true,
          loanToValue,
          performanceFee,
          loanToken,
          loanTokenPrice,
          collateralToken,
          collateralTokenPrice,
          // Note: collateralAssets and collateralAssetsUsd may be null when the Morpho API
          // returns null values for markets with no collateral or during API data sync delays.
          // Consumers should handle null to distinguish between "no data" vs "zero collateral".
          collateralAssets: marketRewardData?.collateralAssets ?? null,
          collateralAssetsUsd: marketRewardData?.collateralAssetsUsd ?? null,
          totalSupply,
          totalSupplyUsd: totalSupply.value * collateralTokenPrice,
          totalSupplyInLoanToken,
          totalBorrows,
          totalBorrowsUsd: totalBorrows.value * loanTokenPrice,
          baseBorrowApy: borrowApy,
          totalBorrowApr: borrowApy,
          baseSupplyApy: 0, //supplyApy,
          totalSupplyApr: 0, //supplyApy,
          rewardsSupplyApy: 0,
          rewardsBorrowApy: 0,
          availableLiquidity,
          availableLiquidityUsd,
          marketParams: {
            loanToken: marketInfo.loanToken,
            collateralToken: marketInfo.collateralToken,
            irm: marketInfo.irm,
            lltv: marketInfo.lltv,
            oracle: marketInfo.oracle,
          },
          rewards: [],
          publicAllocatorSharedLiquidity:
            marketRewardData?.publicAllocatorSharedLiquidity ?? [],
        };

        return [mapping];
      });

      return {
        ...aggregator,
        [environment.chainId]: markets,
      };
    },
    {} as MultichainReturnType<MorphoMarket[]>,
  );

  if (params.includeRewards) {
    const markets = Object.values(result)
      .flat()
      .filter((market) => {
        const environment = params.environments.find(
          (environment) => environment.chainId === market.chainId,
        );
        return environment?.custom.morpho?.minimalDeployment === false;
      });

    const rewards = await getMorphoMarketRewards(
      params.environments.find((env) => env.custom?.morpho?.apiUrl) ??
        params.environments[0],
      markets,
    );

    markets.forEach((market) => {
      const marketReward = rewards.find(
        (reward) =>
          reward.marketId === market.marketId &&
          reward.chainId === market.chainId,
      );
      if (marketReward) {
        market.rewards = marketReward.rewards;
        market.collateralAssets = marketReward.collateralAssets;
        market.publicAllocatorSharedLiquidity =
          marketReward.publicAllocatorSharedLiquidity;
      }

      market.rewardsSupplyApy = market.rewards.reduce<number>(
        (acc, curr) => acc + curr.supplyApr,
        0,
      );

      market.rewardsBorrowApy = market.rewards.reduce<number>(
        (acc, curr) => acc + curr.borrowApr,
        0,
      );

      market.totalSupplyApr = market.rewardsSupplyApy + market.baseSupplyApy;

      market.totalBorrowApr = market.rewardsBorrowApy + market.baseBorrowApy;
    });
  }

  return environmentsWithMarkets.flatMap((environment) => {
    return result[environment.chainId] || [];
  });
}

type GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType = {
  chainId: number;
  marketId: string;
  reallocatableLiquidityAssets: Amount;
  publicAllocatorSharedLiquidity: PublicAllocatorSharedLiquidityType[];
};

type GetMorphoMarketsRewardsReturnType = {
  chainId: number;
  marketId: string;
  collateralAssets: Amount | null;
  collateralAssetsUsd: number | null;
  reallocatableLiquidityAssets: Amount;
  publicAllocatorSharedLiquidity: PublicAllocatorSharedLiquidityType[];
  rewards: Required<MorphoReward>[];
};

async function getMorphoMarketRewards(
  environment: Environment,
  markets: { marketId: string; chainId: number }[],
): Promise<GetMorphoMarketsRewardsReturnType[]> {
  if (markets.length === 0) {
    return [];
  }

  const query = `
  {
    markets(where: { uniqueKey_in: [${markets.map((market) => `"${market.marketId.toLowerCase()}"`).join(",")}], chainId_in: [${markets.map((market) => market.chainId).join(",")}] }) 
    {
      items {
        morphoBlue {
          chain {
            id
          }
        }
        reallocatableLiquidityAssets
        publicAllocatorSharedLiquidity {
          assets
          vault {
            address
            name
            publicAllocatorConfig {
              fee
              flowCaps {
                maxIn
                maxOut
                market {
                  uniqueKey
                }
              }
            }
          }
          allocationMarket {
            uniqueKey
            loanAsset {
              address
            }
            collateralAsset {
              address
            }
            oracleAddress
            irmAddress
            lltv
          }
        }
        collateralAsset {
          decimals
        }
        loanAsset {
          decimals
          priceUsd
        }
        state {
          collateralAssets
          collateralAssetsUsd
          rewards {
            asset {
              address
              symbol
              decimals
              name
            }
            supplyApr
            borrowApr
            amountPerBorrowedToken
            amountPerSuppliedToken
          }
        }
        uniqueKey
      }
    }
  } `;

  const result = await getGraphQL<{
    markets: {
      items: {
        morphoBlue: {
          chain: {
            id: number;
          };
        };
        uniqueKey: string;
        reallocatableLiquidityAssets: string;
        publicAllocatorSharedLiquidity: {
          assets: string;
          vault: {
            address: string;
            name: string;
            publicAllocatorConfig: {
              fee: number;
              flowCaps: {
                market: {
                  uniqueKey: string;
                };
                maxIn: number;
                maxOut: number;
              }[];
            };
          };
          allocationMarket: {
            uniqueKey: string;
            loanAsset: {
              address: string;
            };
            collateralAsset?: {
              address: string;
            };
            oracleAddress: string;
            irmAddress: string;
            lltv: string;
          };
        }[];
        collateralAsset: {
          decimals: number;
        };
        loanAsset: {
          decimals: number;
          priceUsd: number;
        };
        state: {
          collateralAssets: string;
          collateralAssetsUsd: number;
          rewards: {
            asset: {
              address: Address;
              symbol: string;
              decimals: number;
              name: string;
            };
            supplyApr: number;
            amountPerSuppliedToken: string;
            borrowApr: number;
            amountPerBorrowedToken: string;
          }[];
        };
      }[];
    };
  }>(environment, query);

  if (result) {
    const markets = result.markets.items.map((item) => {
      const loanAssetDecimals = item.loanAsset.decimals;
      const mapping: GetMorphoMarketsRewardsReturnType = {
        chainId: item.morphoBlue.chain.id,
        marketId: item.uniqueKey,
        reallocatableLiquidityAssets: new Amount(
          BigInt(item.reallocatableLiquidityAssets),
          loanAssetDecimals,
        ),
        // Note: The Morpho GraphQL API may return null for collateralAssets and
        // collateralAssetsUsd for markets with no collateral deposited or during data sync.
        // We preserve null to let consumers distinguish between "no data" vs "zero collateral".
        collateralAssets:
          item.state.collateralAssets != null
            ? new Amount(
                BigInt(item.state.collateralAssets),
                item.collateralAsset.decimals,
              )
            : null,
        collateralAssetsUsd: item.state.collateralAssetsUsd ?? null,
        publicAllocatorSharedLiquidity: item.publicAllocatorSharedLiquidity.map(
          (item) => ({
            assets:
              Number(item.assets) / 10 ** loanAssetDecimals,
            vault: {
              address: item.vault.address,
              name: item.vault.name,
              publicAllocatorConfig: item.vault.publicAllocatorConfig,
            },
            allocationMarket: item.allocationMarket,
          }),
        ),
        rewards: item.state?.rewards.map((reward) => {
          const tokenDecimals = 10 ** reward.asset.decimals;

          //Supply APR is used only for vaults, zeroing it for now to avoid confusion
          //const tokenAmountPer1000 = ((parseFloat(reward.amountPerSuppliedToken) / item.loanAsset.priceUsd) * 1000) || "0"
          //const amount = (Number(tokenAmountPer1000) / tokenDecimals)

          const borrowTokenAmountPer1000 =
            (Number.parseFloat(reward.amountPerBorrowedToken) /
              item.loanAsset.priceUsd) *
            1000;

          const borrowAmount = borrowTokenAmountPer1000 / tokenDecimals;
          return {
            marketId: item.uniqueKey,
            asset: reward.asset,
            supplyApr: 0, //(reward.supplyApr || 0) * 100,
            supplyAmount: 0, //amount,
            borrowApr: (reward.borrowApr || 0) * 100 * -1,
            borrowAmount: borrowAmount,
          };
        }),
      };

      return mapping;
    });
    return markets;
  } else {
    return [];
  }
}

/**
 * Fetch markets from Lunar Indexer for environments that have the lunar indexer URL configured
 * Falls back to on-chain if indexer fails
 */
async function getMorphoMarketsDataFromIndexer(params: {
  environments: Environment[];
  markets?: string[] | undefined;
  includeRewards?: boolean | undefined;
}): Promise<MorphoMarket[]> {
  const { environments } = params;

  // Filter environments that have lunar-indexer URL configured
  const environmentsWithIndexer = environments.filter(
    (environment) =>
      environment.lunarIndexerUrl &&
      Object.keys(environment.config.morphoMarkets).length > 0,
  );

  if (environmentsWithIndexer.length === 0) {
    return [];
  }

  // Fetch markets from lunar-indexer for each environment
  const marketsSettlements = await Promise.allSettled(
    environmentsWithIndexer.map(async (environment) => {
      const lunarIndexerUrl = environment.lunarIndexerUrl!;

      try {
        const response = await fetchMarketsFromIndexer(
          lunarIndexerUrl,
          environment.chainId,
          params.includeRewards ? { includeRewards: true } : undefined,
        );

        // Filter markets if specific ones were requested
        let markets = response.results;
        if (params.markets) {
          const requestedMarkets = params.markets.map((id) => id.toLowerCase());
          markets = markets.filter((market) =>
            requestedMarkets.includes(market.marketId.toLowerCase()),
          );
        }

        return { environment, markets };
      } catch (error) {
        console.warn(
          `Failed to fetch markets from Lunar Indexer for chain ${environment.chainId}, falling back to on-chain:`,
          error,
        );
        // Return rejection so we can fall back to on-chain for this environment
        return Promise.reject({ environment, error });
      }
    }),
  );

  const fulfilledMarkets = marketsSettlements.flatMap((s) =>
    s.status === "fulfilled" ? [s.value] : [],
  );

  // Collect environments that failed to fetch from indexer for fallback
  const failedEnvironments = marketsSettlements
    .filter((s) => s.status === "rejected")
    .map((s: any) => s.reason?.environment)
    .filter((env) => env !== undefined);

  // Fall back to on-chain for environments where indexer failed
  let fallbackMarkets: MorphoMarket[] = [];
  if (failedEnvironments.length > 0) {
    console.warn(
      `Falling back to on-chain for ${failedEnvironments.length} environment(s)`,
    );
    fallbackMarkets = await getMorphoMarketsDataFromOnChain({
      environments: failedEnvironments,
      markets: params.markets,
      includeRewards: params.includeRewards,
    });
  }

  // Fetch shared liquidity from lunar-indexer, tracking which environments
  // fell back so we can fill them from api.morpho.org after.
  const fallbackChainIds = new Set<number>();
  const sharedLiquiditySettlements = await Promise.allSettled(
    fulfilledMarkets.map(async ({ environment, markets }) => {
      const lunarIndexerUrl = environment.lunarIndexerUrl;
      if (!lunarIndexerUrl)
        return {
          environment,
          data: [] as GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[],
        };

      const marketParamsMap = new Map(
        markets.map((m) => [
          m.marketId.toLowerCase(),
          {
            oracle: m.oracle,
            irm: m.irm,
            lltv: m.lltv,
            loanToken: {
              address: m.loanToken.address,
              decimals: m.loanToken.decimals,
            },
            collateralToken: {
              address: m.collateralToken.address,
              decimals: m.collateralToken.decimals,
            },
          },
        ]),
      );

      try {
        const rawData = await fetchSharedLiquidityFromLunar(
          lunarIndexerUrl,
          environment.chainId,
        );
        const marketIds = markets.map((m) => m.marketId);
        const data = computeSharedLiquidityFromLunar(
          rawData,
          marketIds,
          marketParamsMap,
          environment.chainId,
        );
        return { environment, data };
      } catch (error) {
        if (!shouldFallback(error)) throw error;
        console.debug(
          "[Lunar fallback] Falling back to Morpho API for shared liquidity:",
          error,
        );
        fallbackChainIds.add(environment.chainId);
        return {
          environment,
          data: [] as GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[],
        };
      }
    }),
  );

  const fulfilledSharedLiquidity = sharedLiquiditySettlements.flatMap((s) =>
    s.status === "fulfilled" ? [s.value] : [],
  );

  // Create shared liquidity map by chainId and marketId
  const sharedLiquidityMap = new Map<
    string,
    PublicAllocatorSharedLiquidityType[]
  >();

  fulfilledSharedLiquidity.forEach(({ environment, data }) => {
    data.forEach((item) => {
      const key = `${environment.chainId}-${item.marketId.toLowerCase()}`;
      sharedLiquidityMap.set(key, item.publicAllocatorSharedLiquidity);
    });
  });

  // Seed rewardsDataMap with collateralAssets directly from the lunar-indexer
  // market data — no Morpho API call on the happy path.
  const rewardsDataMap = new Map<string, LunarIndexerRewardsType>();

  fulfilledMarkets.forEach(({ environment, markets }) => {
    markets.forEach((market) => {
      const key = `${environment.chainId}-${market.marketId.toLowerCase()}`;
      const collateralDecimals = market.collateralToken.decimals;
      const collateralAssets = market.totalCollateralAssets
        ? new Amount(
            Number.parseFloat(market.totalCollateralAssets),
            collateralDecimals,
          )
        : null;
      const collateralAssetsUsd = market.totalCollateralAssetsUsd
        ? Number.parseFloat(market.totalCollateralAssetsUsd)
        : null;
      rewardsDataMap.set(key, {
        chainId: environment.chainId,
        marketId: market.marketId,
        collateralAssets,
        collateralAssetsUsd,
        rewardsSupplyApy: 0,
        rewardsBorrowApy: 0,
        rewards: [],
      });
    });
  });

  // Fallback: if the lunar shared-liquidity endpoint failed for some environments,
  // fetch publicAllocatorSharedLiquidity from the Morpho API for those environments only.
  if (fallbackChainIds.size > 0) {
    const fallbackMarketIds = fulfilledMarkets
      .filter(({ environment }) => fallbackChainIds.has(environment.chainId))
      .flatMap(({ environment, markets }) =>
        markets.map((m) => ({
          marketId: m.marketId,
          chainId: environment.chainId,
        })),
      );
    const rewardEnvironment =
      params.environments.find((env) => env.custom?.morpho?.apiUrl) ??
      params.environments[0];
    const morphoApiData = await getMorphoMarketRewards(
      rewardEnvironment,
      fallbackMarketIds,
    );
    morphoApiData.forEach((item) => {
      const key = `${item.chainId}-${item.marketId.toLowerCase()}`;
      if (!sharedLiquidityMap.has(key)) {
        sharedLiquidityMap.set(key, item.publicAllocatorSharedLiquidity);
      }
    });
  }

  // Overlay rewards from the indexer when requested
  if (params.includeRewards) {
    fulfilledMarkets.forEach(({ environment, markets }) => {
      markets.forEach((market) => {
        if (!market.rewards?.length) return;
        const key = `${environment.chainId}-${market.marketId.toLowerCase()}`;
        const rewards: Required<MorphoReward>[] = market.rewards.map((r) => ({
          marketId: market.marketId,
          asset: {
            address: r.token as Address,
            symbol: r.tokenSymbol,
            decimals: r.tokenDecimals,
            name: r.tokenName,
          },
          supplyApr: Number.parseFloat(r.supplyApr),
          supplyAmount: 0,
          borrowApr: Number.parseFloat(r.borrowApr),
          borrowAmount: 0,
        }));
        const existing = rewardsDataMap.get(key);
        rewardsDataMap.set(key, {
          chainId: environment.chainId,
          marketId: market.marketId,
          collateralAssets: existing?.collateralAssets ?? null,
          collateralAssetsUsd: existing?.collateralAssetsUsd ?? null,
          rewardsSupplyApy: rewards.reduce((acc, r) => acc + r.supplyApr, 0),
          rewardsBorrowApy: rewards.reduce((acc, r) => acc + r.borrowApr, 0),
          rewards,
        });
      });
    });
  }

  // Transform markets from indexer format to SDK format
  const transformedMarkets = fulfilledMarkets.flatMap(
    ({ environment, markets }) => {
      return transformMarketsFromIndexer(
        markets,
        environment,
        rewardsDataMap,
        sharedLiquidityMap,
      );
    },
  );

  // Combine indexer results with fallback results
  return [...transformedMarkets, ...fallbackMarkets];
}
