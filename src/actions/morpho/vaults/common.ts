import { type Address, zeroAddress } from "viem";
import { Amount } from "../../../common/amount.js";
import type { MultichainReturnType } from "../../../common/types.js";
import type { Environment, TokenConfig } from "../../../environments/index.js";
import type { MorphoReward } from "../../../types/morphoReward.js";
import type {
  MorphoVault,
  MorphoVaultMarket,
} from "../../../types/morphoVault.js";
import { getGraphQL } from "../utils/graphql.js";
import { WAD, mulDivDown, wMulDown } from "../utils/math.js";

export async function getMorphoVaultsData(params: {
  environments: Environment[];
  vaults?: string[];
  includeRewards?: boolean;
}): Promise<MorphoVault[]> {
  const { environments } = params;

  const environmentsWithVaults = environments.filter(
    (environment) =>
      Object.keys(environment.vaults).length > 0 &&
      environment.contracts.morphoViews,
  );

  const environmentsVaultsInfo = await Promise.all(
    environmentsWithVaults.map((environment) => {
      const vaultsAddresses = Object.values(environment.vaults)
        .map((v) => v.address)
        .filter((address) =>
          params.vaults
            ? params.vaults
                .map((id) => id.toLowerCase())
                .includes(address.toLowerCase())
            : true,
        );
      return environment.contracts.morphoViews?.read.getVaultsInfo([
        vaultsAddresses,
      ]);
    }),
  );

  const result = environmentsWithVaults.reduce(
    (aggregator, environment, environmentIndex) => {
      const environmentVaultsInfo = environmentsVaultsInfo[environmentIndex]!;

      const vaults = environmentVaultsInfo.map((vaultInfo) => {
        const vaultKey = Object.keys(environment.config.tokens).find((key) => {
          return (
            environment.config.tokens[key].address.toLowerCase() ===
            vaultInfo.vault.toLowerCase()
          );
        });

        const vaultToken = environment.config.tokens[vaultKey!];
        const vaultConfig = environment.config.vaults[vaultKey!];
        const underlyingToken =
          environment.config.tokens[vaultConfig.underlyingToken];
        const underlyingPrice = new Amount(vaultInfo.underlyingPrice, 18);

        const vaultSupply = new Amount(
          vaultInfo.totalSupply,
          vaultToken.decimals,
        );
        const totalSupply = new Amount(
          vaultInfo.totalAssets,
          underlyingToken.decimals,
        );
        const totalSupplyUsd = totalSupply.value * underlyingPrice.value;
        const performanceFee = new Amount(vaultInfo.fee, 18).value;
        const timelock = Number(vaultInfo.timelock) / (60 * 60);

        let ratio = 0n;

        const markets = vaultInfo.markets.map((vaultMarket) => {
          ratio += wMulDown(vaultMarket.marketApy, vaultMarket.vaultSupplied);

          const totalSupplied = new Amount(
            vaultMarket.vaultSupplied,
            underlyingToken.decimals,
          );
          const totalSuppliedUsd = totalSupplied.value * underlyingPrice.value;
          const allocation = totalSupplied.value / totalSupply.value;
          const marketLoanToValue =
            new Amount(vaultMarket.marketLltv, 18).value * 100;
          const marketApy = new Amount(vaultMarket.marketApy, 18).value * 100;

          let marketLiquidity = new Amount(
            vaultMarket.marketLiquidity,
            underlyingToken.decimals,
          );
          let marketLiquidityUsd =
            marketLiquidity.value * underlyingPrice.value;

          if (vaultMarket.marketCollateral === zeroAddress) {
            marketLiquidity = totalSupplied;
            marketLiquidityUsd = totalSuppliedUsd;
          }

          const mapping: MorphoVaultMarket = {
            marketId: vaultMarket.marketId,
            allocation,
            marketApy,
            marketCollateral: {
              address: vaultMarket.marketCollateral,
              decimals: 0,
              name: vaultMarket.marketCollateralName,
              symbol: vaultMarket.marketCollateralSymbol,
            },
            marketLiquidity,
            marketLiquidityUsd,
            marketLoanToValue,
            totalSupplied,
            totalSuppliedUsd,
            rewards: [],
          };

          return mapping;
        });

        const avgSupplyApy = mulDivDown(
          ratio,
          WAD - vaultInfo.fee,
          vaultInfo.totalAssets === 0n ? 1n : vaultInfo.totalAssets,
        );
        const baseApy = new Amount(avgSupplyApy, 18).value * 100;

        let totalLiquidity = new Amount(
          markets.reduce(
            (acc, curr) => acc + curr.marketLiquidity.exponential,
            0n,
          ),
          underlyingToken.decimals,
        );
        let totalLiquidityUsd = markets.reduce(
          (acc, curr) => acc + curr.marketLiquidityUsd,
          0,
        );

        if (totalLiquidity.value > totalSupply.value) {
          totalLiquidity = totalSupply;
          totalLiquidityUsd = totalSupplyUsd;
        }

        const mapping: MorphoVault = {
          chainId: environment.chainId,
          vaultKey: vaultKey!,
          vaultToken,
          underlyingToken,
          underlyingPrice: underlyingPrice.value,
          baseApy,
          totalApy: baseApy,
          rewardsApy: 0,
          curators: [],
          performanceFee,
          timelock,
          totalLiquidity,
          totalLiquidityUsd,
          totalSupplyUsd,
          totalSupply,
          vaultSupply,
          markets: markets,
          rewards: [],
        };

        return mapping;
      });

      return {
        ...aggregator,
        [environment.chainId]: vaults,
      };
    },
    {} as MultichainReturnType<MorphoVault[]>,
  );

  // Add rewards to vaults
  if (params.includeRewards === true) {
    const vaults = Object.values(result).flat();
    const rewards = await getMorphoVaultsRewards(vaults);

    vaults.forEach((vault) => {
      const vaultRewards = rewards.find(
        (reward) =>
          reward.vaultToken.address === vault.vaultToken.address &&
          reward.chainId === vault.chainId,
      );

      vault.rewards =
        vaultRewards?.rewards
          .filter((reward) => reward.marketId === undefined)
          .map((reward) => ({
            asset: reward.asset,
            supplyApr: reward.supplyApr,
            supplyAmount: reward.supplyAmount,
            borrowApr: reward.borrowApr,
            borrowAmount: reward.borrowAmount,
          })) || [];

      vault.markets.forEach((market) => {
        const marketRewards =
          vaultRewards?.rewards
            .filter((reward) => reward.marketId === market.marketId)
            .map((reward) => ({
              asset: reward.asset,
              supplyApr: reward.supplyApr,
              supplyAmount: reward.supplyAmount,
              borrowApr: reward.borrowApr,
              borrowAmount: reward.borrowAmount,
            })) || [];

        market.rewards = marketRewards;
        market.rewards.forEach((reward) => {
          const supplyApr = reward.supplyApr * market.allocation;
          const supplyAmount = reward.supplyAmount * market.allocation;

          const vaultReward = vault.rewards.find(
            (r) => r.asset.address === reward.asset.address,
          );
          if (vaultReward) {
            vaultReward.supplyApr += supplyApr;
            vaultReward.supplyAmount += supplyAmount;
          } else {
            vault.rewards.push({
              asset: reward.asset,
              supplyApr,
              supplyAmount,
              borrowApr: 0,
              borrowAmount: 0,
            });
          }
        });
      });

      vault.rewardsApy = vault.rewards.reduce(
        (acc, curr) => acc + curr.supplyApr,
        0,
      );

      vault.totalApy = vault.rewardsApy + vault.baseApy;
    });
  }

  return environments.flatMap((environment) => {
    return result[environment.chainId] || [];
  });
}

type GetMorphoVaultsRewardsResult = {
  chainId: number;
  vaultToken: TokenConfig;
  rewards: MorphoReward[];
};

export async function getMorphoVaultsRewards(
  vaults: MorphoVault[],
): Promise<GetMorphoVaultsRewardsResult[]> {
  const query = `
  {
    vaults(
      where: { address_in: [${vaults.map((vault) => `"${vault.vaultToken.address}"`).join(",")}], chainId_in: [${vaults.map((vault) => vault.chainId).join(",")}] }
    ) {
      items {
        chain {
          id
        }
        id
        address
        asset {
          priceUsd
        }
        state {
          rewards {
            asset {
              address
              symbol,
                decimals
              name
            }
            supplyApr
            amountPerSuppliedToken
          }
        }
      }
    }
    marketPositions(
      where: { userAddress_in: [${vaults.map((vault) => `"${vault.vaultToken.address}"`).join(",")}], chainId_in: [${vaults.map((vault) => vault.chainId).join(",")}] }
    ) {
      items {
        user {
          address
        }
        market {
          morphoBlue {
            chain {
              id
            }
          }
          uniqueKey
          loanAsset {
            priceUsd
          }
          state {
            rewards {
              asset {
                address
                symbol
                decimals
                name
              }
              supplyApr
              amountPerSuppliedToken
            }
          }
        }
      }
    }
  } `;

  const result = await getGraphQL<{
    vaults: {
      items: {
        chain: {
          id: number;
        };
        id: string;
        address: Address;
        asset: {
          priceUsd: number;
        };
        state: {
          rewards: {
            asset: {
              address: Address;
              symbol: string;
              decimals: number;
              name: string;
            };
            supplyApr: number;
            amountPerSuppliedToken: string;
          }[];
        };
      }[];
    };
    marketPositions: {
      items: {
        user: {
          address: Address;
        };
        market: {
          morphoBlue: {
            chain: {
              id: number;
            };
          };
          uniqueKey: string;
          loanAsset: {
            priceUsd: number;
          };
          state: {
            rewards: {
              asset: {
                address: Address;
                symbol: string;
                decimals: number;
                name: string;
              };
              supplyApr: number;
              amountPerSuppliedToken: string;
            }[];
          };
        };
      }[];
    };
  }>(query);

  if (result) {
    try {
      const marketsRewards = result.marketPositions.items.flatMap((item) => {
        const rewards = (item.market.state?.rewards || []).map((reward) => {
          const tokenAmountPer1000 =
            (Number.parseFloat(reward.amountPerSuppliedToken) /
              item.market.loanAsset.priceUsd) *
            1000;
          const tokenDecimals = 10 ** reward.asset.decimals;
          const amount = Number(tokenAmountPer1000) / tokenDecimals;

          return {
            chainId: item.market.morphoBlue.chain.id,
            vaultId: item.user.address,
            marketId: item.market.uniqueKey,
            asset: reward.asset,
            supplyApr: (reward.supplyApr || 0) * 100,
            supplyAmount: amount,
            borrowApr: 0,
            borrowAmount: 0,
          };
        });
        return rewards;
      });

      const vaultsRewards = result.vaults.items.flatMap((item) => {
        return (item.state?.rewards || []).map((reward) => {
          const tokenAmountPer1000 =
            (Number.parseFloat(reward.amountPerSuppliedToken) /
              item.asset.priceUsd) *
            1000;
          const tokenDecimals = 10 ** reward.asset.decimals;
          const amount = Number(tokenAmountPer1000) / tokenDecimals;

          return {
            chainId: item.chain.id,
            vaultId: item.address,
            marketId: undefined,
            asset: reward.asset,
            supplyApr: (reward.supplyApr || 0) * 100,
            supplyAmount: amount,
            borrowApr: 0,
            borrowAmount: 0,
          };
        });
      });

      const rewards = [...marketsRewards, ...vaultsRewards];

      return vaults.map((vault) => {
        return {
          chainId: vault.chainId,
          vaultToken: vault.vaultToken,
          rewards: rewards
            .filter(
              (reward) =>
                reward.vaultId === vault.vaultToken.address &&
                reward.chainId === vault.chainId,
            )
            .map((reward) => {
              return {
                marketId: reward.marketId,
                asset: reward.asset,
                supplyApr: reward.supplyApr,
                supplyAmount: reward.supplyAmount,
                borrowApr: reward.borrowApr,
                borrowAmount: reward.borrowAmount,
              };
            }),
        };
      });
    } catch (ex) {
      return vaults.map((vault) => {
        return {
          chainId: vault.chainId,
          vaultToken: vault.vaultToken,
          rewards: [],
        };
      });
    }
  } else {
    return vaults.map((vault) => {
      return {
        chainId: vault.chainId,
        vaultToken: vault.vaultToken,
        rewards: [],
      };
    });
  }
}
