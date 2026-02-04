import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { type Address, getContract, parseAbi, zeroAddress } from "viem";

dayjs.extend(utc);
import { Amount } from "../../../common/amount.js";
import type { MultichainReturnType } from "../../../common/types.js";
import {
  type Environment,
  type TokenConfig,
  publicEnvironments,
} from "../../../environments/index.js";
import {
  findMarketByAddress,
  findTokenByAddress,
} from "../../../environments/utils/index.js";
import type { MorphoReward } from "../../../types/morphoReward.js";
import type {
  MorphoVault,
  MorphoVaultMarket,
} from "../../../types/morphoVault.js";
import { getGraphQL, getVaultV2Apy } from "../utils/graphql.js";
import {
  SECONDS_PER_YEAR,
  WAD,
  mulDivDown,
  toAssetsDown,
  wMulDown,
} from "../utils/math.js";

export async function getMorphoVaultsData(params: {
  environments: Environment[];
  vaults?: string[];
  includeRewards?: boolean;
  currentChainRewardsOnly?: boolean;
}): Promise<MorphoVault[]> {
  const { environments } = params;

  const environmentsWithVaults = environments.filter(
    (environment) =>
      Object.keys(environment.vaults).length > 0 &&
      environment.contracts.morphoViews,
  );

  // Query vaults for each environment, combining v1 and v2 results per environment
  const environmentsVaultsInfoSettlements = await Promise.allSettled(
    environmentsWithVaults.map(async (environment) => {
      // Split vaults by version
      const v1VaultsAddresses = Object.entries(environment.config.vaults)
        .filter(([_, config]) => !config.version || config.version === 1)
        .map(([key, _]) => environment.vaults[key]?.address)
        .filter((address): address is `0x${string}` => address !== undefined)
        .filter((address) =>
          params.vaults
            ? params.vaults
                .map((id) => id.toLowerCase())
                .includes(address.toLowerCase())
            : true,
        );

      const v2VaultsAddresses = Object.entries(environment.config.vaults)
        .filter(([_, config]) => config.version === 2)
        .map(([key, _]) => environment.vaults[key]?.address)
        .filter((address): address is `0x${string}` => address !== undefined)
        .filter((address) =>
          params.vaults
            ? params.vaults
                .map((id) => id.toLowerCase())
                .includes(address.toLowerCase())
            : true,
        );

      // Run v1 and v2 queries in parallel within this environment
      const queryPromises: Promise<
        | readonly {
            vault: `0x${string}`;
            totalSupply: bigint;
            totalAssets: bigint;
            underlyingPrice: bigint;
            fee: bigint;
            timelock: bigint;
            markets: readonly {
              marketId: `0x${string}`;
              marketCollateral: `0x${string}`;
              marketCollateralName: string;
              marketCollateralSymbol: string;
              marketLltv: bigint;
              marketApy: bigint;
              marketLiquidity: bigint;
              vaultSupplied: bigint;
            }[];
          }[]
        | undefined
      >[] = [];

      // Query v1 vaults with morphoViews
      if (v1VaultsAddresses.length > 0 && environment.contracts.morphoViews) {
        queryPromises.push(
          (async () => {
            try {
              const vaultInfo =
                await environment.contracts.morphoViews?.read.getVaultsInfo([
                  v1VaultsAddresses,
                ]);
              return vaultInfo;
            } catch (error) {
              return undefined;
            }
          })(),
        );
      }

      // Query v2 vaults with morphoViewsV2
      if (v2VaultsAddresses.length > 0 && environment.contracts.morphoViewsV2) {
        queryPromises.push(
          (async () => {
            try {
              const vaultInfoV2 =
                await environment.contracts.morphoViewsV2?.read.getVaultsInfo([
                  v2VaultsAddresses,
                ]);

              // Extract unique underlying vault addresses from V2 adapters
              const underlyingVaultAddresses =
                vaultInfoV2
                  ?.flatMap((v2Vault: any) =>
                    v2Vault.adapters?.map(
                      (adapter: any) => adapter.underlyingVault,
                    ),
                  )
                  .filter((addr: any) => addr && addr !== zeroAddress) || [];

              const uniqueUnderlyingAddresses = [
                ...new Set(underlyingVaultAddresses),
              ] as `0x${string}`[];

              // Query underlying V1 vaults to get their market positions
              const underlyingVaultsData: Map<string, any> = new Map();
              if (
                uniqueUnderlyingAddresses.length > 0 &&
                environment.contracts.morphoViews
              ) {
                const underlyingInfo =
                  await environment.contracts.morphoViews.read.getVaultsInfo([
                    uniqueUnderlyingAddresses,
                  ]);

                // Map by vault address for quick lookup
                underlyingInfo?.forEach((vaultData: any, index: number) => {
                  underlyingVaultsData.set(
                    uniqueUnderlyingAddresses[index].toLowerCase(),
                    vaultData,
                  );
                });
              }

              // Transform v2 structure to v1 structure
              const transformedVaults = vaultInfoV2?.map((v2Vault: any) => {
                // Get the first adapter (assuming single adapter for now)
                const adapter = v2Vault.adapters?.[0];

                if (!adapter) {
                  return {
                    vault: v2Vault.vault,
                    totalSupply: v2Vault.totalSupply,
                    totalAssets: v2Vault.totalAssets,
                    underlyingPrice: v2Vault.underlyingPrice,
                    fee: 0n,
                    timelock: 0n,
                    markets: [],
                  };
                }

                // Get underlying vault data for accurate market allocations
                const underlyingVaultData = underlyingVaultsData.get(
                  adapter.underlyingVault.toLowerCase(),
                );

                let markets: any[] = [];

                if (underlyingVaultData?.markets) {
                  // Map V1 vault's markets with scaled allocations
                  markets = underlyingVaultData.markets.map((v1Market: any) => {
                    // Scale the V1 vault's position by V2's ownership
                    // V2 ownership = realAssets / underlyingVaultTotalAssets
                    const scaledVaultSupplied =
                      adapter.underlyingVaultTotalAssets > 0n
                        ? (v1Market.vaultSupplied * adapter.realAssets) /
                          adapter.underlyingVaultTotalAssets
                        : 0n;

                    return {
                      marketId: v1Market.marketId,
                      marketCollateral: v1Market.marketCollateral,
                      marketCollateralName: v1Market.marketCollateralName,
                      marketCollateralSymbol: v1Market.marketCollateralSymbol,
                      marketLltv: v1Market.marketLltv,
                      marketApy: v1Market.marketApy,
                      marketLiquidity: v1Market.marketLiquidity,
                      vaultSupplied: scaledVaultSupplied,
                    };
                  });
                } else {
                  // Fallback: if we can't get V1 data, use underlyingMarkets with 0 allocations
                  markets =
                    (adapter.underlyingMarkets || []).map(
                      (underlyingMarket: any) => ({
                        marketId: underlyingMarket.marketId,
                        marketCollateral: underlyingMarket.collateralToken,
                        marketCollateralName: underlyingMarket.collateralName,
                        marketCollateralSymbol:
                          underlyingMarket.collateralSymbol,
                        marketLltv: underlyingMarket.marketLltv,
                        marketApy: underlyingMarket.marketSupplyApy,
                        marketLiquidity: underlyingMarket.marketLiquidity,
                        vaultSupplied: 0n,
                      }),
                    ) || [];
                }

                return {
                  vault: v2Vault.vault,
                  totalSupply: v2Vault.totalSupply,
                  totalAssets: v2Vault.totalAssets,
                  underlyingPrice: v2Vault.underlyingPrice,
                  fee: adapter.underlyingVaultFee,
                  timelock: adapter.underlyingVaultTimelock,
                  markets,
                };
              });

              return transformedVaults;
            } catch (error) {
              return undefined;
            }
          })(),
        );
      }

      const queryResults = await Promise.all(queryPromises);
      const results = queryResults
        .filter((r): r is NonNullable<typeof r> => r !== undefined)
        .flat();

      // Sort results to match the order in environment.config.vaults
      const vaultKeys = Object.keys(environment.config.vaults);
      const sortedResults = results.sort((a, b) => {
        const aIndex = vaultKeys.findIndex(
          (key) =>
            environment.vaults[key]?.address.toLowerCase() ===
            a.vault.toLowerCase(),
        );
        const bIndex = vaultKeys.findIndex(
          (key) =>
            environment.vaults[key]?.address.toLowerCase() ===
            b.vault.toLowerCase(),
        );
        return aIndex - bIndex;
      });

      return sortedResults;
    }),
  );

  const environmentsVaultsInfo = environmentsVaultsInfoSettlements.map((s) => {
    if (s.status === "fulfilled") {
      return s.value;
    }
    return [];
  });

  const result = await environmentsWithVaults.reduce<
    Promise<MultichainReturnType<MorphoVault[]>>
  >(
    async (aggregatorPromise, environment, environmentIndex) => {
      const aggregator = await aggregatorPromise;
      const environmentVaultsInfo = environmentsVaultsInfo[environmentIndex]!;

      if (!environmentVaultsInfo) {
        return aggregator;
      }

      // Batch fetch V2 APY data for all V2 vaults upfront
      const v2VaultsToFetch = environmentVaultsInfo.filter((vaultInfo) => {
        const vaultKey = Object.keys(environment.config.tokens).find(
          (key) =>
            environment.config.tokens[key].address.toLowerCase() ===
            vaultInfo.vault.toLowerCase(),
        );
        const vaultConfig = environment.config.vaults[vaultKey!];
        return vaultConfig?.version === 2;
      });

      const v2ApyDataMap = new Map<
        string,
        Awaited<ReturnType<typeof getVaultV2Apy>>
      >();

      if (v2VaultsToFetch.length > 0) {
        const v2ApySettlements = await Promise.allSettled(
          v2VaultsToFetch.map((vaultInfo) =>
            getVaultV2Apy(environment, vaultInfo.vault, environment.chainId),
          ),
        );

        v2ApySettlements.forEach((settlement, index) => {
          if (settlement.status === "fulfilled" && settlement.value) {
            v2ApyDataMap.set(
              v2VaultsToFetch[index].vault.toLowerCase(),
              settlement.value,
            );
          }
        });
      }

      const settled = await Promise.allSettled(
        environmentVaultsInfo.map(
          async (vaultInfo: {
            vault: `0x${string}`;
            totalSupply: bigint;
            totalAssets: bigint;
            underlyingPrice: bigint;
            fee: bigint;
            timelock: bigint;
            markets: readonly {
              marketId: `0x${string}`;
              marketCollateral: `0x${string}`;
              marketCollateralName: string;
              marketCollateralSymbol: string;
              marketLltv: bigint;
              marketApy: bigint;
              marketLiquidity: bigint;
              vaultSupplied: bigint;
            }[];
          }) => {
            const vaultKey = Object.keys(environment.config.tokens).find(
              (key) => {
                return (
                  environment.config.tokens[key].address.toLowerCase() ===
                  vaultInfo.vault.toLowerCase()
                );
              },
            );

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
            let baseApy = 0;
            let v2ApyData:
              | Awaited<ReturnType<typeof getVaultV2Apy>>
              | undefined;

            // For v2 vaults, use batched APY data
            if (vaultConfig.version === 2) {
              v2ApyData = v2ApyDataMap.get(vaultInfo.vault.toLowerCase());
              if (v2ApyData) {
                // Use avgNetApy (net APY including rewards)
                baseApy = v2ApyData.avgNetApy * 100;
              }
            }

            const markets = vaultInfo.markets.map(
              (vaultMarket: {
                marketId: `0x${string}`;
                marketCollateral: `0x${string}`;
                marketCollateralName: string;
                marketCollateralSymbol: string;
                marketLltv: bigint;
                marketApy: bigint;
                marketLiquidity: bigint;
                vaultSupplied: bigint;
              }) => {
                ratio += wMulDown(
                  vaultMarket.marketApy,
                  vaultMarket.vaultSupplied,
                );

                const totalSupplied = new Amount(
                  vaultMarket.vaultSupplied,
                  underlyingToken.decimals,
                );
                const totalSuppliedUsd =
                  totalSupplied.value * underlyingPrice.value;
                const allocation = totalSupplied.value / totalSupply.value;
                const marketLoanToValue =
                  new Amount(vaultMarket.marketLltv, 18).value * 100;
                const marketApy =
                  new Amount(vaultMarket.marketApy, 18).value * 100;

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
              },
            );

            // Only calculate baseApy from markets for v1 vaults
            // v2 vaults already have baseApy from Morpho API
            if (vaultConfig.version !== 2) {
              const avgSupplyApy = mulDivDown(
                ratio,
                WAD - vaultInfo.fee,
                vaultInfo.totalAssets === 0n ? 1n : vaultInfo.totalAssets,
              );
              baseApy = new Amount(avgSupplyApy, 18).value * 100;
            }

            let totalLiquidity: Amount;
            let totalLiquidityUsd: number;

            // V2 vaults: Use liquidity from Morpho API
            // V1 vaults: Sum up market liquidity
            if (vaultConfig.version === 2 && v2ApyData) {
              // Use liquidity data from Morpho API
              totalLiquidity = new Amount(
                BigInt(v2ApyData.liquidity || "0"),
                underlyingToken.decimals,
              );
              totalLiquidityUsd = v2ApyData.liquidityUsd || 0;
            } else {
              // V1 vaults: sum market liquidity
              totalLiquidity = new Amount(
                markets.reduce(
                  (acc: bigint, curr: MorphoVaultMarket) =>
                    acc + curr.marketLiquidity.exponential,
                  0n,
                ),
                underlyingToken.decimals,
              );

              totalLiquidityUsd = markets.reduce(
                (acc: number, curr: MorphoVaultMarket) =>
                  acc + curr.marketLiquidityUsd,
                0,
              );

              // Cap liquidity at totalSupply for V1 vaults
              if (totalLiquidity.value > totalSupply.value) {
                totalLiquidity = totalSupply;
                totalLiquidityUsd = totalSupplyUsd;
              }
            }

            let totalStaked = new Amount(0n, underlyingToken.decimals);
            let totalStakedUsd = 0;

            if (vaultConfig.multiReward) {
              const [
                distributorTotalSupply,
                vaultTotalSupply,
                vaultTotalAssets,
              ] = await Promise.all([
                getTotalSupplyData(environment, vaultConfig.multiReward),
                getTotalSupplyData(environment, vaultToken.address),
                getTotalAssetsData(environment, vaultToken.address),
              ]);

              const stakedAssets = toAssetsDown(
                distributorTotalSupply,
                vaultTotalAssets,
                vaultTotalSupply,
              );

              totalStaked = new Amount(stakedAssets, underlyingToken.decimals);
              totalStakedUsd = totalStaked.value * underlyingPrice.value;
            }

            const mapping: MorphoVault = {
              chainId: environment.chainId,
              vaultKey: vaultKey!,
              version: vaultConfig.version || 1,
              deprecated: vaultConfig.deprecated === true,
              vaultToken,
              underlyingToken,
              underlyingPrice: underlyingPrice.value,
              baseApy,
              totalApy: baseApy,
              rewardsApy: 0,
              stakingRewardsApr: 0,
              totalStakingApr: baseApy,
              curators: [],
              performanceFee,
              timelock,
              totalLiquidity,
              totalLiquidityUsd,
              totalSupplyUsd,
              totalSupply,
              vaultSupply,
              totalStaked,
              totalStakedUsd,
              markets: markets,
              rewards: [],
              stakingRewards: [],
            };

            return mapping;
          },
        ),
      );

      const vaults = settled.flatMap((s) =>
        s.status === "fulfilled" ? s.value : [],
      );

      return {
        ...(await aggregator),
        [environment.chainId]: vaults,
      };
    },
    Promise.resolve({} as MultichainReturnType<MorphoVault[]>),
  );

  // Add rewards to vaults
  if (params.includeRewards === true) {
    // add stake rewards

    const flatList = Object.values(result).flat();

    for (const vault of flatList) {
      const environment = params.environments.find(
        (environment) => environment.chainId === vault.chainId,
      );

      if (!environment) {
        continue;
      }

      // Fetch market prices from the views contract to calculate rewards
      const homeEnvironment =
        (Object.values(publicEnvironments) as Environment[]).find((e) =>
          e.custom?.governance?.chainIds?.includes(environment.chainId),
        ) || environment;

      const viewsContract = environment.contracts.views;
      const homeViewsContract = homeEnvironment.contracts.views;

      const data = await Promise.all([
        viewsContract?.read.getAllMarketsInfo(),
        homeViewsContract?.read.getNativeTokenPrice(),
        homeViewsContract?.read.getGovernanceTokenPrice(),
      ]);

      const [allMarkets, nativeTokenPriceRaw, governanceTokenPriceRaw] = data;

      const governanceTokenPrice = new Amount(
        governanceTokenPriceRaw || 0n,
        18,
      );
      const nativeTokenPrice = new Amount(nativeTokenPriceRaw || 0n, 18);

      let tokenPrices =
        allMarkets
          ?.map((marketInfo) => {
            const marketFound = findMarketByAddress(
              environment,
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
      if (environment.custom?.governance?.token) {
        tokenPrices = [
          ...tokenPrices,
          {
            token:
              environment.config.tokens[environment.custom.governance.token]!,
            tokenPrice: governanceTokenPrice,
          },
        ];
      }

      // Add native token to token prices
      tokenPrices = [
        ...tokenPrices,
        {
          token: findTokenByAddress(environment, zeroAddress)!,
          tokenPrice: nativeTokenPrice,
        },
      ];

      const vaultConfig = environment?.config.vaults[vault.vaultKey];

      if (!environment || !vaultConfig || !vaultConfig.multiReward) {
        continue;
      }

      const rewards = await getRewardsData(
        environment,
        vaultConfig.multiReward,
      );

      const distributorTotalSupply = await getTotalSupplyData(
        environment,
        vaultConfig.multiReward,
      );

      rewards
        .filter(
          (reward) =>
            reward?.periodFinish &&
            dayjs.utc().isBefore(dayjs.unix(Number(reward.periodFinish))),
        )
        .forEach((reward) => {
          const token = Object.values(environment.config.tokens).find(
            (token) => token.address === reward?.token,
          );
          if (!token || !reward?.rewardRate) return;

          const market = tokenPrices.find(
            (m) => m?.token.address === reward.token,
          );

          const rewardPriceUsd = market?.tokenPrice.value ?? 0;

          const rewardsPerYear =
            new Amount(reward.rewardRate, market?.token.decimals ?? 18).value *
            SECONDS_PER_YEAR *
            rewardPriceUsd;

          vault.stakingRewards.push({
            apr:
              (rewardsPerYear /
                (new Amount(distributorTotalSupply, vault.vaultToken.decimals)
                  .value *
                  vault.underlyingPrice)) *
              100,
            token: token,
          });
        });

      vault.stakingRewardsApr = vault.stakingRewards.reduce(
        (acc, curr) => acc + curr.apr,
        0,
      );
      vault.totalStakingApr = vault.stakingRewardsApr + vault.baseApy;
    }

    const vaults = Object.values(result)
      .flat()
      .filter((vault) => {
        const environment = params.environments.find(
          (environment) => environment.chainId === vault.chainId,
        );
        return environment?.custom.morpho?.minimalDeployment === false;
      });

    const rewards = await getMorphoVaultsRewards(
      params.environments[0],
      vaults,
      params.currentChainRewardsOnly,
    );

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

const getRewardsData = async (
  environment: Environment,
  multiRewardsAddress: Address,
) => {
  if (!environment.custom.multiRewarder) {
    return [];
  }

  const multiRewardAbi = parseAbi([
    "function rewardData(address token) view returns (address, uint256, uint256, uint256, uint256, uint256)",
  ]);

  const multiRewardContract = getContract({
    address: multiRewardsAddress,
    abi: multiRewardAbi,
    client: environment.publicClient,
  });

  const rewards = await Promise.all(
    environment.custom.multiRewarder.map(async (multiRewarder) => {
      const tokenAddress =
        environment.tokens[multiRewarder.rewardToken].address;

      if (!tokenAddress) {
        return;
      }

      try {
        const rewardData = await multiRewardContract.read.rewardData([
          tokenAddress,
        ]);
        return {
          rewardRate: BigInt(rewardData[3]),
          token: tokenAddress,
          periodFinish: BigInt(rewardData[2]),
        };
      } catch {
        return { rewardRate: 0n, token: tokenAddress };
      }
    }),
  );

  return rewards.filter(Boolean);
};

const getTotalSupplyData = async (
  environment: Environment,
  multiRewardsAddress: Address,
) => {
  if (!environment.custom.multiRewarder) {
    return 0n;
  }

  const multiRewardAbi = parseAbi([
    "function totalSupply() view returns (uint256)",
  ]);

  const multiRewardContract = getContract({
    address: multiRewardsAddress,
    abi: multiRewardAbi,
    client: environment.publicClient,
  });
  try {
    const totalSupply = await multiRewardContract.read.totalSupply();
    return BigInt(totalSupply);
  } catch {
    return 0n;
  }
};

const getTotalAssetsData = async (
  environment: Environment,
  multiRewardsAddress: Address,
) => {
  if (!environment.custom.multiRewarder) {
    return 0n;
  }

  const multiRewardAbi = parseAbi([
    "function totalAssets() view returns (uint256)",
  ]);

  const multiRewardContract = getContract({
    address: multiRewardsAddress,
    abi: multiRewardAbi,
    client: environment.publicClient,
  });
  try {
    const totalAssets = await multiRewardContract.read.totalAssets();
    return BigInt(totalAssets);
  } catch {
    return 0n;
  }
};

type GetMorphoVaultsRewardsResult = {
  chainId: number;
  vaultToken: TokenConfig;
  rewards: MorphoReward[];
};

export async function getMorphoVaultsRewards(
  environment: Environment,
  vaults: MorphoVault[],
  currentChainRewardsOnly?: boolean,
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
              symbol
              decimals
              name
              chain {
                id
              }
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
                chain {
                  id
                }
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
              chain: {
                id: number;
              };
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
                chain: {
                  id: number;
                };
              };
              supplyApr: number;
              amountPerSuppliedToken: string;
            }[];
          };
        };
      }[];
    };
  }>(environment, query);

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
            chainId: reward.asset.chain.id,
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
            chainId: reward.asset.chain.id,
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
                reward.vaultId.toLowerCase() ===
                  vault.vaultToken.address.toLowerCase() &&
                (reward.chainId === vault.chainId || !currentChainRewardsOnly),
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
