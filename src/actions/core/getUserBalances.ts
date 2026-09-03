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

/**
 * Reads one token balance. Rejects when the read fails — it must never resolve
 * to a zero, which is what it did before MOO-832: an RPC failure surfaced to
 * consumers as a "successful" empty wallet. The Moonwell frontend gates repay-all
 * on this figure, so a transient RPC hiccup on a 5s refetch read as "wallet is
 * empty" and disabled the confirm button for 59 users (Sentry
 * MOONWELL-FRONTEND-195). Callers settle these with `Promise.allSettled` and
 * omit the rejected tokens, so a consumer that finds no entry knows the balance
 * is UNKNOWN rather than zero. The failure is routed to `environment.onError`
 * (source `user-balances-token-read`) so Sentry-wired consumers can see the
 * degraded read.
 */
const getTokenBalance = async (
  environment: Environment,
  userAddress: Address,
  tokenAddress: Address,
): Promise<{ amount: bigint; token: `0x${string}` }> => {
  try {
    if (tokenAddress === zeroAddress) {
      const balance = await environment.publicClient.getBalance({
        address: userAddress,
      });
      return { amount: BigInt(balance), token: tokenAddress };
    }

    const erc20Abi = parseAbi([
      "function balanceOf(address owner) view returns (uint256)",
    ]);

    const erc20Contract = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client: environment.publicClient,
    });

    const balance = await erc20Contract.read.balanceOf([userAddress]);
    return { amount: BigInt(balance), token: tokenAddress };
  } catch (error) {
    environment.onError?.(error, {
      source: "user-balances-token-read",
      chainId: environment.chainId,
      token: tokenAddress,
    });
    throw error;
  }
};

async function getTokenBalancesFromEnvironment(
  environment: Environment,
  userAddress: Address,
): Promise<{ amount: bigint; token: `0x${string}` }[]> {
  // Try the views multicall first (single RPC for N tokens). Some chains ship a
  // staking-only views contract (Ethereum's at the time of writing) that doesn't
  // implement getTokensBalances and reverts on the call — in that case fall
  // through to per-token balanceOf reads instead of returning empty balances.
  if (environment.contracts.views) {
    try {
      const tokenBalancesFromView =
        await environment.contracts.views.read.getTokensBalances([
          Object.values(environment.config.tokens).map(
            (token) => token.address,
          ),
          userAddress,
        ]);

      return [...tokenBalancesFromView];
    } catch (error) {
      environment.onError?.(error, {
        source: "user-balances-views-fallback",
        chainId: environment.chainId,
      });
    }
  }

  const tokenBalancesSettled = await Promise.allSettled(
    Object.values(environment.config.tokens).map((token) =>
      getTokenBalance(environment, userAddress, token.address),
    ),
  );

  return tokenBalancesSettled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );
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
