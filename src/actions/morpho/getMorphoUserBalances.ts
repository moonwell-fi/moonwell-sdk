import type { Address } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import { findTokenByAddress } from "../../environments/utils/index.js";
import type { UserBalance } from "../../types/userBalance.js";

export type GetMorphoUserBalancesParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  userAddress: Address;
};

export type GetMorphoUserBalancesReturnType = Promise<UserBalance[]>;

export async function getMorphoUserBalances<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoUserBalancesParameters<environments, Network>,
): GetMorphoUserBalancesReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const environmentsTokensBalancesSettled = await Promise.allSettled(
    environments.map(async (environment) => {
      const viewsRead = environment.contracts.views?.read;

      if (!viewsRead || !viewsRead?.getTokensBalances) {
        return Promise.reject(new Error("No views read contract"));
      }

      const uniqueTokenAddresses = [
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
      ];
      try {
        return await viewsRead.getTokensBalances([
          [...uniqueTokenAddresses],
          args.userAddress,
        ]);
      } catch (error) {
        return Promise.reject(error);
      }
    }),
  );

  const environmentsTokensBalances = environmentsTokensBalancesSettled.map(
    (s) => (s.status === "fulfilled" ? [...s.value] : []),
  );

  const tokensBalances = environments.flatMap((curr, index) => {
    const balances = environmentsTokensBalances[index]!;
    if (!balances) {
      return [];
    }

    const userBalances = balances
      .map((balance) => {
        const token = findTokenByAddress(curr, balance.token);
        if (token) {
          const result: UserBalance = {
            chainId: curr.chainId,
            account: args.userAddress,
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

  return tokensBalances;
}
