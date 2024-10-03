import { Amount, type MultichainReturnType } from "../../common/index.js";
import type { Environment } from "../../environments/index.js";
import { findTokenByAddress } from "../../environments/utils/index.js";
import type { UserBalance } from "../types/userBalance.js";

export async function getMorphoUserBalances(params: {
  environments: Environment[];
  account: `0x${string}`;
}): Promise<MultichainReturnType<UserBalance[]>> {
  const { environments, account } = params;

  const environmentsTokensBalances = await Promise.all(
    environments.map((environment) => {
      return environment.contracts.views?.read.getTokensBalances([
        [
          // Remove duplicates
          ...new Set([
            ...Object.values(environment.config.vaults).map(
              (vault) =>
                environment.config.tokens[vault.underlyingToken]!.address,
            ),
            ...Object.values(environment.config.vaults).map(
              (vault) => environment.config.tokens[vault.vaultToken]!.address,
            ),
            ...Object.values(environment.config.morphoMarkets).map(
              (market) =>
                environment.config.tokens[market.collateralToken]!.address,
            ),
            ...Object.values(environment.config.morphoMarkets).map(
              (market) => environment.config.tokens[market.loanToken]!.address,
            ),
          ]),
        ],
        params.account,
      ]);
    }),
  );

  const tokensBalances = environments.reduce(
    (prev, curr, index) => {
      const balances = environmentsTokensBalances[index]!;
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
    },
    {} as MultichainReturnType<UserBalance[]>,
  );

  return tokensBalances;
}
