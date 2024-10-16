import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type {
  MorphoMarket,
  PublicAllocatorSharedLiquidityType,
} from "../../../types/morphoMarket.js";
import type { MorphoReward } from "../../../types/morphoReward.js";
import { getGraphQL } from "../utils/graphql.js";

export async function getMorphoMarketsData(params: {
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

  const environmentsMarketsInfo = await Promise.all(
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

      return environment.contracts.morphoViews?.read.getMorphoBlueMarketsInfo([
        marketsIds,
      ]);
    }),
  );

  const result = environmentsWithMarkets.reduce(
    (aggregator, environment, environmentIndex) => {
      const environmentMarketsInfo = environmentsMarketsInfo[environmentIndex]!;

      const markets = environmentMarketsInfo.map((marketInfo) => {
        const marketConfig = Object.values(
          environment.config.morphoMarkets,
        ).find(
          (item) => item.id.toLowerCase() === marketInfo.marketId.toLowerCase(),
        )!;
        const loanToken = environment.config.tokens[marketConfig.loanToken];
        const collateralToken =
          environment.config.tokens[marketConfig.collateralToken];

        const oraclePrice = new Amount(
          marketInfo.oraclePrice,
          36 + loanToken.decimals - collateralToken.decimals,
        ).value;

        const collateralTokenPrice = new Amount(marketInfo.collateralPrice, 18)
          .value;
        const loanTokenPrice = new Amount(marketInfo.loanPrice, 18).value;

        const performanceFee = new Amount(marketInfo.fee, 18).value;
        const loanToValue = new Amount(marketInfo.lltv, 18).value;

        const totalSupplyInLoanToken = new Amount(
          marketInfo.totalSupplyAssets,
          loanToken.decimals,
        );

        const totalSupply = new Amount(
          totalSupplyInLoanToken.value / oraclePrice,
          collateralToken.decimals,
        );
        const totalBorrows = new Amount(
          marketInfo.totalBorrowAssets,
          loanToken.decimals,
        );

        // Supply APR is used only for vaults, zeroing it for now to avoid confusion
        // const supplyApy = new Amount(marketInfo.supplyApy, 18).value * 100;
        const borrowApy = new Amount(marketInfo.borrowApy, 18).value * 100;

        const mapping: MorphoMarket = {
          chainId: environment.chainId,
          marketId: marketInfo.marketId,
          deprecated: marketConfig.deprecated === true,
          loanToValue,
          performanceFee,
          loanToken,
          loanTokenPrice,
          collateralToken,
          collateralTokenPrice,
          totalSupply,
          totalSupplyUsd: totalSupply.value * collateralTokenPrice,
          totalSupplyInLoanToken,
          totalBorrows,
          totalBorrowsUsd: totalBorrows.value * loanTokenPrice,
          baseBorrowApy: borrowApy,
          totalBorrowApr: borrowApy,
          baseSupplyApy: 0, //supplyApy,
          totalSupplyApr: 0, //supplyApy,
          availableLiquidity: new Amount(0, collateralToken.decimals),
          availableLiquidityUsd: 0,
          marketParams: {
            loanToken: loanToken.address,
            collateralToken: collateralToken.address,
            irm: marketInfo.irm,
            lltv: marketInfo.lltv,
            oracle: marketInfo.oracle,
          },
          rewards: [],
          publicAllocatorSharedLiquidity: [],
        };

        return mapping;
      });

      return {
        ...aggregator,
        [environment.chainId]: markets,
      };
    },
    {} as MultichainReturnType<MorphoMarket[]>,
  );

  if (params.includeRewards) {
    const markets = Object.values(result).flat();
    const rewards = await getMorphoMarketRewards(markets);

    markets.forEach((market) => {
      const marketReward = rewards.find(
        (reward) =>
          reward.marketId === market.marketId &&
          reward.chainId === market.chainId,
      );
      if (marketReward) {
        market.rewards = marketReward.rewards;
        market.publicAllocatorSharedLiquidity =
          marketReward.publicAllocatorSharedLiquidity;
        market.availableLiquidity = marketReward.reallocatableLiquidityAssets;
        market.availableLiquidityUsd =
          marketReward.reallocatableLiquidityAssets.value *
          market.loanTokenPrice;
      }

      market.totalSupplyApr =
        market.rewards.reduce((acc, curr) => acc + curr.supplyApr, 0) +
        market.baseSupplyApy;
      market.totalBorrowApr =
        market.rewards.reduce((acc, curr) => acc + curr.borrowApr, 0) +
        market.baseBorrowApy;
    });
  }

  return environments.flatMap((environment) => {
    return result[environment.chainId] || [];
  });
}

type GetMorphoMarketsRewardsReturnType = {
  chainId: number;
  marketId: string;
  collateralAssets: Amount;
  reallocatableLiquidityAssets: Amount;
  publicAllocatorSharedLiquidity: PublicAllocatorSharedLiquidityType[];
  rewards: Required<MorphoReward>[];
};

async function getMorphoMarketRewards(
  markets: MorphoMarket[],
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
                maxIn: string;
                maxOut: string;
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
  }>(query);

  if (result) {
    const markets = result.markets.items.map((item) => {
      const mapping: GetMorphoMarketsRewardsReturnType = {
        chainId: item.morphoBlue.chain.id,
        marketId: item.uniqueKey,
        reallocatableLiquidityAssets: new Amount(
          BigInt(item.reallocatableLiquidityAssets),
          item.loanAsset.decimals,
        ),
        collateralAssets: new Amount(
          BigInt(item.state.collateralAssets),
          item.collateralAsset.decimals,
        ),
        publicAllocatorSharedLiquidity: item.publicAllocatorSharedLiquidity,
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
            borrowApr: (reward.borrowApr || 0) * 100,
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
