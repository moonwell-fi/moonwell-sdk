"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketsData = void 0;
const viem_1 = require("viem");
const index_js_1 = require("../../../common/index.js");
const index_js_2 = require("../../../environments/index.js");
const index_js_3 = require("../../../environments/utils/index.js");
const index_js_4 = require("../../../common/index.js");
const getMarketsData = async (environment) => {
    const homeEnvironment = Object.values(index_js_2.publicEnvironments).find((e) => e.custom?.governance?.chainIds?.includes(environment.chainId)) || environment;
    const viewsContract = environment.contracts.views;
    const homeViewsContract = homeEnvironment.contracts.views;
    const marketData = await Promise.all([
        viewsContract?.read.getProtocolInfo(),
        viewsContract?.read.getAllMarketsInfo(),
        homeViewsContract?.read.getNativeTokenPrice(),
        homeViewsContract?.read.getGovernanceTokenPrice(),
    ]);
    const { seizePaused, transferPaused } = marketData[0];
    const allMarketsInfo = marketData[1];
    const nativeTokenPriceRaw = marketData[2];
    const governanceTokenPriceRaw = marketData[3];
    const governanceTokenPrice = new index_js_1.Amount(governanceTokenPriceRaw, 18);
    const nativeTokenPrice = new index_js_1.Amount(nativeTokenPriceRaw, 18);
    const markets = [];
    const tokenPrices = allMarketsInfo
        .map((marketInfo) => {
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
    for (const marketInfo of allMarketsInfo) {
        const marketFound = (0, index_js_3.findMarketByAddress)(environment, marketInfo.market);
        if (marketFound) {
            const { marketConfig, marketToken, underlyingToken } = marketFound;
            const supplyCaps = new index_js_1.Amount(marketInfo.supplyCap, underlyingToken.decimals);
            const borrowCaps = new index_js_1.Amount(marketInfo.borrowCap, underlyingToken.decimals);
            const collateralFactor = new index_js_1.Amount(marketInfo.collateralFactor, 18)
                .value;
            const underlyingPrice = new index_js_1.Amount(marketInfo.underlyingPrice, 36 - underlyingToken.decimals).value;
            const marketTotalSupply = new index_js_1.Amount(marketInfo.totalSupply, marketToken.decimals);
            const totalBorrows = new index_js_1.Amount(marketInfo.totalBorrows, underlyingToken.decimals);
            const totalReserves = new index_js_1.Amount(marketInfo.totalReserves, underlyingToken.decimals);
            const cash = new index_js_1.Amount(marketInfo.cash, underlyingToken.decimals);
            const exchangeRate = new index_js_1.Amount(marketInfo.exchangeRate, 10 + underlyingToken.decimals).value;
            const reserveFactor = new index_js_1.Amount(marketInfo.reserveFactor, 18).value;
            const borrowRate = new index_js_1.Amount(marketInfo.borrowRate, 18);
            const supplyRate = new index_js_1.Amount(marketInfo.supplyRate, 18);
            const totalSupply = new index_js_1.Amount(marketTotalSupply.value * exchangeRate, underlyingToken.decimals);
            const totalSupplyUsd = totalSupply.value * underlyingPrice;
            const totalBorrowsUsd = totalBorrows.value * underlyingPrice;
            const totalReservesUsd = totalReserves.value * underlyingPrice;
            const supplyCapsUsd = supplyCaps.value * underlyingPrice;
            const borrowCapsUsd = borrowCaps.value * underlyingPrice;
            const baseSupplyApy = (0, index_js_4.calculateApy)(supplyRate.value);
            const baseBorrowApy = (0, index_js_4.calculateApy)(borrowRate.value);
            const market = {
                chainId: environment.chainId,
                seizePaused,
                transferPaused,
                deprecated: marketConfig.deprecated === true,
                borrowCaps,
                borrowCapsUsd,
                cash,
                collateralFactor,
                exchangeRate,
                marketToken,
                reserveFactor,
                supplyCaps,
                supplyCapsUsd,
                totalBorrows,
                totalBorrowsUsd,
                totalReserves,
                totalReservesUsd,
                totalSupply,
                totalSupplyUsd,
                underlyingPrice,
                underlyingToken,
                baseBorrowApy,
                baseSupplyApy,
                totalBorrowApr: 0,
                totalSupplyApr: 0,
                rewards: [],
            };
            for (const incentive of marketInfo.incentives) {
                let { borrowIncentivesPerSec, supplyIncentivesPerSec, token: tokenAddress, } = incentive;
                const token = (0, index_js_3.findTokenByAddress)(environment, tokenAddress);
                if (token) {
                    const isGovernanceToken = token.symbol === environment.custom?.governance?.token;
                    const isNativeToken = token.address === viem_1.zeroAddress;
                    const tokenPrice = tokenPrices.find((r) => r?.token.address === incentive.token)?.tokenPrice.value;
                    const price = isNativeToken
                        ? nativeTokenPrice.value
                        : isGovernanceToken
                            ? governanceTokenPrice.value
                            : tokenPrice;
                    if (price) {
                        if (token.symbol === "USDC" && borrowIncentivesPerSec === 1n) {
                            borrowIncentivesPerSec = 0n;
                        }
                        const supplyRewardsPerDayUsd = (0, index_js_4.perDay)(new index_js_1.Amount(supplyIncentivesPerSec, token.decimals).value) *
                            price;
                        const borrowRewardsPerDayUsd = (0, index_js_4.perDay)(new index_js_1.Amount(borrowIncentivesPerSec, token.decimals).value) *
                            price;
                        const supplyApr = (supplyRewardsPerDayUsd / totalSupplyUsd) * index_js_1.DAYS_PER_YEAR * 100;
                        const borrowApr = (borrowRewardsPerDayUsd / totalBorrowsUsd) * index_js_1.DAYS_PER_YEAR * 100;
                        market.rewards.push({
                            borrowApr,
                            supplyApr,
                            token,
                        });
                    }
                }
            }
            market.totalSupplyApr = market.rewards.reduce((prev, curr) => prev + curr.supplyApr, market.baseSupplyApy);
            market.totalBorrowApr =
                market.baseBorrowApy -
                    market.rewards.reduce((prev, curr) => prev + curr.borrowApr, 0);
            markets.push(market);
        }
    }
    return markets;
};
exports.getMarketsData = getMarketsData;
//# sourceMappingURL=common.js.map