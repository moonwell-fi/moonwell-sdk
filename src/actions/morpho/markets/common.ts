import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment } from "../../../environments/index.js";
import type {
  MorphoMarket,
  PublicAllocatorSharedLiquidityType,
} from "../../../types/morphoMarket.js";
import type { MorphoReward } from "../../../types/morphoReward.js";
import { getGraphQL, getSubgraph } from "../utils/graphql.js";

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

  const environmentPublicAllocatorSharedLiquiditySettlements =
    await Promise.allSettled(
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

        return getMorphoMarketPublicAllocatorSharedLiquidity(
          environment,
          marketsIds,
        );
      }),
    );

  const fulfilledPublicAllocatorSharedLiquidity =
    environmentPublicAllocatorSharedLiquiditySettlements.flatMap((s, i) =>
      s.status === "fulfilled"
        ? [
            {
              environment: environmentsWithMarkets[i]!,
              sharedLiquidity:
                s.value as GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[],
            },
          ]
        : [],
    );

  const sharedLiquidityByChain = new Map<
    number,
    GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[]
  >(
    fulfilledPublicAllocatorSharedLiquidity.map((x) => [
      x.environment.chainId,
      x.sharedLiquidity,
    ]),
  );

  const result = fulfilledMarketsInfo.reduce(
    (aggregator, { environment, marketsInfo }) => {
      const markets = marketsInfo.map((marketInfo) => {
        const marketKey = Object.keys(environment.config.morphoMarkets).find(
          (item) =>
            environment.config.morphoMarkets[item].id.toLowerCase() ===
            marketInfo.marketId.toLowerCase(),
        )!;

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

        const envSharedLiquidity = sharedLiquidityByChain.get(
          environment.chainId,
        );
        const publicAllocatorSharedLiquidity = envSharedLiquidity?.find(
          (item) => item.marketId === marketInfo.marketId,
        );

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

        const availableLiquidity =
          publicAllocatorSharedLiquidity?.reallocatableLiquidityAssets ||
          new Amount(0, 18);
        const availableLiquidityUsd =
          availableLiquidity?.value * loanTokenPrice;
        const collateralAssets =
          publicAllocatorSharedLiquidity?.collateralAssets || new Amount(0, 18);

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
          collateralAssets,
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
            publicAllocatorSharedLiquidity?.publicAllocatorSharedLiquidity ||
            [],
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
    const markets = Object.values(result)
      .flat()
      .filter((market) => {
        const environment = params.environments.find(
          (environment) => environment.chainId === market.chainId,
        );
        return environment?.custom.morpho?.minimalDeployment === false;
      });

    const rewards = await getMorphoMarketRewards(markets);

    markets.forEach((market) => {
      const marketReward = rewards.find(
        (reward) =>
          reward.marketId === market.marketId &&
          reward.chainId === market.chainId,
      );
      if (marketReward) {
        market.rewards = marketReward.rewards;

        // market.collateralAssets = marketReward.collateralAssets;
        // market.publicAllocatorSharedLiquidity =
        //   marketReward.publicAllocatorSharedLiquidity;
        // market.availableLiquidity = marketReward.reallocatableLiquidityAssets;
        // market.availableLiquidityUsd =
        //   marketReward.reallocatableLiquidityAssets.value *
        //   market.loanTokenPrice;
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

  return environments.flatMap((environment) => {
    return result[environment.chainId] || [];
  });
}

type GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType = {
  chainId: number;
  marketId: string;
  collateralAssets: Amount;
  reallocatableLiquidityAssets: Amount;
  publicAllocatorSharedLiquidity: PublicAllocatorSharedLiquidityType[];
};

async function getMorphoMarketPublicAllocatorSharedLiquidity(
  environment: Environment,
  markets: string[],
): Promise<GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[]> {
  if (markets.length === 0) {
    return [];
  }
  const query = `
  {
    metaMorphos(
      where: {hasPublicAllocator: true, markets_: {market_in: [${markets.map((market) => `"${market.toLowerCase()}"`).join(",")}]}}
    ) {
      id
      name
      lastTotalAssets
      markets {
        market {
          id
        }
        enabled
        cap
      }
      publicAllocator {
        id
        fee
        markets {
          id
          flowCapIn
          flowCapOut
          market {
            market {
              id
              oracle {
                oracleAddress
              }
              irm
              lltv
              totalBorrow
              totalSupply
              totalCollateral
              inputToken {
                symbol
                decimals
                id
              }
              borrowedToken {
                symbol
                decimals
                id
              }
            }
          }
        }
      }    
      account {
        positions(where:{side:SUPPLIER}) {
          market {
            id
          }
          balance
        }
      }
    }
  }
  `;

  const result = await getSubgraph<{
    metaMorphos: Array<{
      id: string;
      name: string;
      lastTotalAssets: string;
      markets: Array<{
        market: {
          id: string;
        };
        enabled: boolean;
        cap: string;
      }>;
      publicAllocator: {
        id: string;
        fee: string;
        markets: Array<{
          id: string;
          flowCapIn: string;
          flowCapOut: string;
          market: {
            market: {
              id: string;
              oracle: {
                oracleAddress: string;
              };
              irm: string;
              lltv: string;
              totalBorrow: string;
              totalSupply: string;
              totalCollateral: string;
              inputToken: {
                symbol: string;
                decimals: number;
                id: string;
              };
              borrowedToken: {
                symbol: string;
                decimals: number;
                id: string;
              };
            };
          };
        }>;
      };
      account: {
        positions: Array<{
          market: {
            id: string;
          };
          balance: string;
        }>;
      };
    }>;
  }>(environment, query);

  if (result) {
    const returnValue: GetMorphoMarketsPublicAllocatorSharedLiquidityReturnType[] =
      [];

    for (const market of markets) {
      let inputTokenDecimals = 0;
      let outputTokenDecimals = 0;

      let collateralAssets = 0;
      let reallocatableLiquidityAssets = 0;
      const r: PublicAllocatorSharedLiquidityType[] = [];
      const marketRemainingLiquidity: Record<string, number> = {};

      const vaults = result.metaMorphos.filter(
        (item) =>
          item.publicAllocator.markets.some(
            (vaultMarket) =>
              vaultMarket.market.market.id.toLowerCase() ===
              market.toLowerCase(),
          ) &&
          item.account.positions.some(
            (position) =>
              position.market.id.toLowerCase() === market.toLowerCase() &&
              Number(position.balance) > 0,
          ),
      );

      for (const vault of vaults) {
        const otherMarkets = vault.publicAllocator.markets.filter(
          (publicAllocatorMarket) =>
            publicAllocatorMarket.market.market.id.toLowerCase() !==
            market.toLowerCase(),
        );
        const thisMarket = vault.publicAllocator.markets.find(
          (publicAllocatorMarket) =>
            publicAllocatorMarket.market.market.id.toLowerCase() ===
            market.toLowerCase(),
        );
        const thisMarketCaps = vault.markets.find(
          (marketCaps) =>
            marketCaps.market.id.toLowerCase() === market.toLowerCase(),
        );
        const thisMarketCap = Number(thisMarketCaps?.cap || 0); //Should I check if the cap is enabled?
        const suppliedToMarket = vault.account.positions.find(
          (position) =>
            position.market.id.toLowerCase() === market.toLowerCase(),
        );
        const suppliedToMarketAmount = Number(suppliedToMarket?.balance || 0);
        const thisMarketCapRemaining = thisMarketCap - suppliedToMarketAmount;
        let maxIn = Math.min(
          Number(thisMarket?.flowCapIn),
          thisMarketCapRemaining,
        );
        collateralAssets = Number(
          thisMarket?.market.market.totalCollateral || 0,
        );
        inputTokenDecimals = thisMarket?.market.market.inputToken.decimals || 0;
        outputTokenDecimals =
          thisMarket?.market.market.borrowedToken.decimals || 0;

        const otherMarketsLiquidity: {
          marketId: string;
          amount: number;
          liquidity: number;
          vault: any;
          allocationMarket: any;
        }[] = [];
        for (const otherMarket of otherMarkets) {
          const vaultSuppliedToMarket = vault.account.positions.find(
            (position) =>
              position.market.id.toLowerCase() ===
              otherMarket.market.market.id.toLowerCase(),
          );
          if (vaultSuppliedToMarket) {
            const vaultSuppliedAmount = Number(vaultSuppliedToMarket.balance);
            const maxOut = Number(otherMarket.flowCapOut);
            const liquidity =
              Number(otherMarket.market.market.totalSupply) -
              Number(otherMarket.market.market.totalBorrow);
            if (vaultSuppliedAmount > 0 && maxOut > 0 && liquidity > 0) {
              otherMarketsLiquidity.push({
                marketId: otherMarket.market.market.id,
                amount: Math.min(liquidity, vaultSuppliedAmount, maxOut),
                liquidity,
                vault: {
                  address: vault.id,
                  name: vault.name,
                  publicAllocatorConfig: {
                    fee: Number(vault.publicAllocator.fee),
                    flowCaps: vault.publicAllocator.markets.map(
                      (publicAllocatorMarket) => ({
                        maxIn: Number(publicAllocatorMarket.flowCapIn),
                        maxOut: Number(publicAllocatorMarket.flowCapOut),
                        market: {
                          uniqueKey: publicAllocatorMarket.market.market.id,
                        },
                      }),
                    ),
                  },
                },
                allocationMarket: {
                  uniqueKey: otherMarket.market.market.id,
                  loanAsset: {
                    address: otherMarket.market.market.borrowedToken.id,
                  },
                  collateralAsset: {
                    address: otherMarket.market.market.inputToken.id,
                  },
                  oracleAddress: otherMarket.market.market.oracle.oracleAddress,
                  irmAddress: otherMarket.market.market.irm,
                  lltv: otherMarket.market.market.lltv,
                },
              });
            }
          }
        }

        for (const otherMarket of otherMarketsLiquidity
          .filter((item) => item.amount > 0)
          .sort((a, b) => b.amount - a.amount)) {
          const marketLiquidity =
            marketRemainingLiquidity[otherMarket.marketId] ||
            otherMarket.liquidity;
          if (maxIn > 0 && marketLiquidity > 0) {
            const assets = Math.min(marketLiquidity, otherMarket.amount, maxIn);
            maxIn = maxIn - assets;
            marketRemainingLiquidity[otherMarket.marketId] =
              marketLiquidity - assets;
            reallocatableLiquidityAssets += assets;
            r.push({
              assets,
              vault: otherMarket.vault,
              allocationMarket: otherMarket.allocationMarket,
            });
          }
        }
      }

      returnValue.push({
        chainId: environment.chainId,
        marketId: market.toLowerCase(),
        collateralAssets: new Amount(
          BigInt(collateralAssets),
          inputTokenDecimals,
        ),
        reallocatableLiquidityAssets: new Amount(
          BigInt(reallocatableLiquidityAssets),
          outputTokenDecimals,
        ),
        publicAllocatorSharedLiquidity: r,
      });
    }

    return returnValue;
  } else {
    return [];
  }
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
        publicAllocatorSharedLiquidity: item.publicAllocatorSharedLiquidity.map(
          (item) => ({
            assets: Number(item.assets),
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
