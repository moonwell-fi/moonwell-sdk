"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPositionData = void 0;
const viem_1 = require("viem");
const index_js_1 = require("../../../common/index.js");
const index_js_2 = require("../../../environments/index.js");
const index_js_3 = require("../../utils/index.js");
const getUserPositionData = async (environment, account) => {
    const homeEnvironment = Object.values(index_js_2.publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;
    const viewsContract = environment.contracts.views;
    const homeViewsContract = homeEnvironment.contracts.views;
    const userData = await Promise.all([
        viewsContract?.read.getAllMarketsInfo(),
        viewsContract?.read.getUserBalances([account]),
        viewsContract?.read.getUserBorrowsBalances([account]),
        viewsContract?.read.getUserMarketsMemberships([account]),
        viewsContract?.read.getUserRewards([account]),
        homeViewsContract?.read.getNativeTokenPrice(),
        homeViewsContract?.read.getGovernanceTokenPrice(),
    ]);
    const [allMarkets, balances, borrows, memberships, rewards, nativeTokenPriceRaw, governanceTokenPriceRaw,] = userData;
    const governanceTokenPrice = new index_js_1.Amount(governanceTokenPriceRaw || 0n, 18);
    const nativeTokenPrice = new index_js_1.Amount(nativeTokenPriceRaw || 0n, 18);
    const tokenPrices = allMarkets
        ?.map((marketInfo) => {
        const marketFound = (0, index_js_3.findMarketByAddress)(environment, marketInfo.market);
        if (marketFound) {
            return {
                token: marketFound.underlyingToken,
                tokenPrice: new index_js_1.Amount(marketInfo.underlyingPrice, 36 - marketFound.underlyingToken.decimals),
            };
        }
        else {
            return;
        }
    })
        .filter((token) => !!token);
    const markets = allMarkets
        ?.map((marketInfo) => {
        const market = (0, index_js_3.findMarketByAddress)(environment, marketInfo.market);
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
            const marketRewards = rewards?.filter((r) => r.market === marketInfo.market) || [];
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
                chainId: environment.chainId,
                account,
                market: market.marketToken,
                collateralEnabled: marketCollateralEnabled,
                borrowed,
                borrowedUsd,
                collateral,
                collateralUsd,
                rewards: marketRewards
                    .filter((reward) => {
                    const token = (0, index_js_3.findTokenByAddress)(environment, reward.rewardToken);
                    return token !== undefined;
                })
                    .map((reward) => {
                    const token = (0, index_js_3.findTokenByAddress)(environment, reward.rewardToken);
                    const isGovernanceToken = token.symbol === environment.custom?.governance?.token;
                    const isNativeToken = token.address === viem_1.zeroAddress;
                    const tokenPrice = tokenPrices?.find((r) => r?.token.address === reward.rewardToken)?.tokenPrice.value;
                    const price = (isNativeToken
                        ? nativeTokenPrice.value
                        : isGovernanceToken
                            ? governanceTokenPrice.value
                            : tokenPrice) || 0;
                    const supplyRewards = new index_js_1.Amount(reward.supplyRewardsAmount, token.decimals);
                    const borrowRewards = new index_js_1.Amount(reward.borrowRewardsAmount, token.decimals);
                    const result = {
                        chainId: environment.chainId,
                        account,
                        market: market.marketToken,
                        rewardToken: token,
                        supplyRewards,
                        supplyRewardsUsd: supplyRewards.value * price,
                        borrowRewards,
                        borrowRewardsUsd: borrowRewards.value * price,
                    };
                    return result;
                }),
                supplied,
                suppliedUsd,
            };
            return result;
        }
        else {
            return;
        }
    })
        .filter((r) => r !== undefined);
    const result = {
        account,
        chainId: environment.chainId,
        markets,
        totalBorrowedUsd: markets.reduce((acc, market) => acc + market.borrowedUsd, 0),
        totalSuppliedUsd: markets.reduce((acc, market) => acc + market.suppliedUsd, 0),
        totalCollateralUsd: markets.reduce((acc, market) => acc + market.collateralUsd, 0),
    };
    return result;
};
exports.getUserPositionData = getUserPositionData;
//# sourceMappingURL=common.js.map