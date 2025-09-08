import {
  type Address,
  type Chain,
  getContract,
  parseAbi,
  zeroAddress,
} from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Environment } from "../../environments/index.js";
import { findTokenByAddress } from "../../environments/utils/index.js";
import type { UserBalance } from "../../types/userBalance.js";

export type GetUserBalancesParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserBalancesReturnType = Promise<UserBalance[]>;

const getTokenBalance = async (
  environment: Environment,
  userAddress: Address,
  tokenAddress: Address,
) => {
  try {
    if (tokenAddress === zeroAddress) {
      return new Promise<{ amount: bigint; token: `0x${string}` }>(
        (resolve) => {
          environment.publicClient
            .getBalance({
              address: userAddress,
            })
            .then((balance) => {
              resolve({ amount: BigInt(balance), token: tokenAddress });
            })
            .catch(() => {
              resolve({ amount: 0n, token: tokenAddress });
            });
        },
      );
    }

    const erc20Abi = parseAbi([
      "function balanceOf(address owner) view returns (uint256)",
    ]);

    const erc20Contract = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client: environment.publicClient,
    });

    const result = new Promise<{ amount: bigint; token: `0x${string}` }>(
      (resolve) => {
        erc20Contract.read
          .balanceOf([userAddress])
          .then((balance) => {
            resolve({ amount: BigInt(balance), token: tokenAddress });
          })
          .catch(() => {
            resolve({ amount: 0n, token: tokenAddress });
          });
      },
    );

    return result;
  } catch (error) {
    console.error("getTokenBalance error", error);
    return { amount: 0n, token: tokenAddress };
  }
};

async function getTokenBalancesFromEnvironment(
  environment: Environment,
  userAddress: Address,
): Promise<{ amount: bigint; token: `0x${string}` }[]> {
  try {
    if (environment.contracts.views) {
      const tokenBalancesFromView =
        await environment.contracts.views.read.getTokensBalances([
          Object.values(environment.config.tokens).map(
            (token) => token.address,
          ),
          userAddress,
        ]);

      return [...tokenBalancesFromView];
    }

    const tokenBalancesSettled = await Promise.allSettled(
      Object.values(environment.config.tokens).map((token) =>
        getTokenBalance(environment, userAddress, token.address),
      ),
    );

    const res = tokenBalancesSettled.flatMap((s) =>
      s.status === "fulfilled" ? s.value : [],
    );
    return res;
  } catch (error) {
    console.error("getTokenBalancesFromEnvironment error", error);
    return [];
  }
}

export async function getUserBalances<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserBalancesParameters<environments, Network>,
): GetUserBalancesReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args, false);

  const environmentsTokensBalancesSettled = await Promise.allSettled(
    environments.map((env) =>
      getTokenBalancesFromEnvironment(env, userAddress),
    ),
  );

  const environmentsTokensBalances = environmentsTokensBalancesSettled.map(
    (s) => (s.status === "fulfilled" ? [...s.value] : []),
  );

  // Fetch morpho staking balances
  await Promise.all(
    environments.map(async (env, index) => {
      if (!env.config.vaults) return;

      const vaultBalancesSettled = await Promise.allSettled(
        Object.values(env.config.vaults)
          .filter((vault) => vault.multiReward)
          .map((vault) =>
            getTokenBalance(env, userAddress, vault.multiReward!),
          ),
      );

      const vaultBalances = vaultBalancesSettled.flatMap((s) =>
        s.status === "fulfilled" ? s.value : [],
      );

      const envBalances = environmentsTokensBalances[index] || [];
      environmentsTokensBalances[index] = [...envBalances, ...vaultBalances];
    }),
  );

  const result = environments.flatMap((env, index) => {
    const balances = environmentsTokensBalances[index] || [];

    const userBalances = balances
      .map((balance) => {
        const token = findTokenByAddress(env, balance.token);
        const vault = Object.values(env.config.vaults || {}).find(
          (v) => v.multiReward === balance.token,
        );

        if (token) {
          const result: UserBalance = {
            chainId: env.chainId,
            account: userAddress,
            token,
            tokenBalance: new Amount(balance.amount, token.decimals),
          };
          return result;
        }
        if (vault?.multiReward) {
          const vaultToken = env.config.tokens[vault.vaultToken];
          const result: UserBalance = {
            chainId: env.chainId,
            account: userAddress,
            token: {
              address: vault.multiReward,
              decimals: vaultToken.decimals,
              name: `stk${vaultToken.symbol}`,
              symbol: `stk${vaultToken.symbol}`,
            },
            tokenBalance: new Amount(balance.amount, vaultToken.decimals),
          };
          return result;
        }

        return undefined;
      })
      .filter((balance): balance is UserBalance => balance !== undefined);

    return userBalances;
  });

  return result;
}
