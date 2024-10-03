"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPositionData = void 0;
const index_js_1 = require("../../../common/index.js");
const index_js_2 = require("../../../environments/utils/index.js");
const getUserPositionData = async (params) => {
    const viewsContract = params.environment.contracts.views;
    const userData = await Promise.all([
        viewsContract?.read.getAllMarketsInfo(),
        viewsContract?.read.getUserBalances([params.account]),
        viewsContract?.read.getUserBorrowsBalances([params.account]),
        viewsContract?.read.getUserMarketsMemberships([params.account]),
    ]);
    const [allMarkets, balances, borrows, memberships,] = userData;
    const markets = allMarkets
        ?.map((marketInfo) => {
        const market = (0, index_js_2.findMarketByAddress)(params.environment, marketInfo.market);
        if (market) {
            const { marketToken, underlyingToken } = market;
            const underlyingPrice = new index_js_1.Amount(marketInfo.underlyingPrice, 36 - underlyingToken.decimals).value;
            const collateralFactor = new index_js_1.Amount(marketInfo.collateralFactor, 18)
                .value;
            const exchangeRate = new index_js_1.Amount(marketInfo.exchangeRate, 10 + underlyingToken.decimals).value;
            const marketCollateralEnabled = memberships?.find((r) => r.token === marketInfo.market)
                ?.membership === true;
            const marketBorrowedRaw = borrows?.find((r) => r.token === marketInfo.market)?.amount || 0n;
            const marketSuppliedRaw = balances?.find((r) => r.token === marketInfo.market)?.amount || 0n;
            const borrowed = new index_js_1.Amount(marketBorrowedRaw, market.underlyingToken.decimals);
            const borrowedUsd = borrowed.value * underlyingPrice;
            const marketSupplied = new index_js_1.Amount(marketSuppliedRaw, marketToken.decimals);
            const supplied = new index_js_1.Amount(marketSupplied.value * exchangeRate, underlyingToken.decimals);
            const suppliedUsd = supplied.value * underlyingPrice;
            const collateral = marketCollateralEnabled
                ? new index_js_1.Amount(supplied.value * collateralFactor, underlyingToken.decimals)
                : new index_js_1.Amount(0n, underlyingToken.decimals);
            const collateralUsd = collateral.value * underlyingPrice;
            const result = {
                chainId: params.environment.chainId,
                account: params.account,
                market: market.marketToken,
                collateralEnabled: marketCollateralEnabled,
                borrowed,
                borrowedUsd,
                collateral,
                collateralUsd,
                supplied,
                suppliedUsd,
            };
            return result;
        }
        else {
            return;
        }
    })
        .filter((r) => r !== undefined)
        .filter((r) => params.markets ? params.markets.includes(r.market.address) : true);
    return markets;
};
exports.getUserPositionData = getUserPositionData;
//# sourceMappingURL=common.js.map