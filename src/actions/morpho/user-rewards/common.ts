import lodash from "lodash";
const { uniq } = lodash;
import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { Environment, TokenConfig } from "../../../environments/index.js";
import type { MorphoUserReward } from "../../../types/morphoUserReward.js";
import { getGraphQL } from "../utils/graphql.js";

export async function getUserMorphoRewardsData(params: {
  environment: Environment;
  account: `0x${string}`;
}): Promise<MorphoUserReward[]> {
  if (params.environment.custom.morpho?.minimalDeployment === false) {
    const rewards = await getMorphoRewardsData(
      params.environment.chainId,
      params.account,
    );

    const assets = await getMorphoAssetsData(
      rewards.map((r) => r.asset.address),
    );

    const result: (MorphoUserReward | undefined)[] = rewards.map((r) => {
      const asset = assets.find(
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
    });

    return result.filter((r) => r !== undefined) as MorphoUserReward[];
  }

  return [];
}

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
    `https://rewards.morpho.org/v1/users/${account}/rewards?chain_id=${chainId}`,
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
