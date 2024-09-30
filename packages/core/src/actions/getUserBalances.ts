import type { UserBalance } from "@/types/userBalance.js";
import { findTokenByAddress } from "@/utils/index.js";
import { Amount, type MultichainReturnType } from "@moonwell-sdk/common";
import type { Environment } from "@moonwell-sdk/environments";

export type GetUserBalancesReturnType = MultichainReturnType<UserBalance[]>;

export async function getUserBalances(params: {
  environments: Environment[];
  account: `0x${string}`;
}): Promise<GetUserBalancesReturnType | undefined> {
  const { environments, account } = params;

  try {
    const environmentsTokensBalances = await Promise.all(
      environments.map((environment) => {
        return Promise.all([
          environment.contracts.views?.read.getTokensBalances([
            Object.values(environment.config.tokens).map((token) => token.address),
            params.account,
          ]),
        ]);
      }),
    );

    const tokensBalances = environments.reduce((prev, curr, index) => {
      const balances = environmentsTokensBalances[index]![0]!;

      const userBalances = balances
        .map((balance) => {
          const token = findTokenByAddress(curr, balance.token);
          if (token) {
            const result: UserBalance = {
              chainId: curr.chainId,
              account,
              token,
              tokenBalance: new Amount(balance.amount, token.decimals),
            };
            return result;
          } else {
            return;
          }
        })
        .filter((item) => item !== undefined) as UserBalance[];

      return {
        ...prev,
        [curr.chainId]: userBalances,
      };
    }, {} as GetUserBalancesReturnType);

    return tokensBalances;
  } catch (ex) {
    console.error("[tokensBalances] An error occured...", ex);
    return;
  }
}
