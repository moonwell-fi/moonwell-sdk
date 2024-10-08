import type { Address, Chain } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { NetworkParameterType } from "../../common/types.js";
import { findTokenByAddress } from "../../environments/utils/index.js";
import type { UserBalance } from "../../types/userBalance.js";

export type GetUserBalancesParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** User address*/
  userAddress: Address;
};

export type GetUserBalancesReturnType = Promise<UserBalance[]>;

export async function getUserBalances<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserBalancesParameters<environments, Network>,
): GetUserBalancesReturnType {
  const { userAddress } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  const environmentsTokensBalances = await Promise.all(
    environments.map((environment) => {
      return Promise.all([
        environment.contracts.views?.read.getTokensBalances([
          Object.values(environment.config.tokens).map(
            (token) => token.address,
          ),
          userAddress,
        ]),
      ]);
    }),
  );

  const result = environments.flatMap((env, index) => {
    const balances = environmentsTokensBalances[index]![0]!;

    const userBalances = balances
      .map((balance) => {
        const token = findTokenByAddress(env, balance.token);
        if (token) {
          const result: UserBalance = {
            chainId: env.chainId,
            account: userAddress,
            token,
            tokenBalance: new Amount(balance.amount, token.decimals),
          };
          return result;
        } else {
          return;
        }
      })
      .filter((item) => item !== undefined) as UserBalance[];

    return userBalances;
  });

  return result;
}
