"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBalances = void 0;
const index_js_1 = require("../../common/index.js");
const index_js_2 = require("../../environments/utils/index.js");
async function getUserBalances(params) {
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
            const token = (0, index_js_2.findTokenByAddress)(curr, balance.token);
            if (token) {
                const result = {
                    chainId: curr.chainId,
                    account,
                    token,
                    tokenBalance: new index_js_1.Amount(balance.amount, token.decimals),
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
exports.getUserBalances = getUserBalances;
//# sourceMappingURL=getUserBalances.js.map