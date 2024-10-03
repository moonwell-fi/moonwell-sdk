import { Amount } from "../../common/index.js";
import { findTokenByAddress } from "../../environments/utils/index.js";
export async function getUserBalances(params) {
    const { environments, account } = params;
    const environmentsTokensBalances = await Promise.all(environments.map((environment) => {
        return Promise.all([
            environment.contracts.views?.read.getTokensBalances([
                Object.values(environment.config.tokens).map((token) => token.address),
                params.account,
            ]),
        ]);
    }));
    const tokensBalances = environments.reduce((prev, curr, index) => {
        const balances = environmentsTokensBalances[index][0];
        const userBalances = balances
            .map((balance) => {
            const token = findTokenByAddress(curr, balance.token);
            if (token) {
                const result = {
                    chainId: curr.chainId,
                    account,
                    token,
                    tokenBalance: new Amount(balance.amount, token.decimals),
                };
                return result;
            }
            else {
                return;
            }
        })
            .filter((item) => item !== undefined);
        return {
            ...prev,
            [curr.chainId]: userBalances,
        };
    }, {});
    return tokensBalances;
}
//# sourceMappingURL=getUserBalances.js.map