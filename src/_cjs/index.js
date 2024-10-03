"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("./environments/index.js");
const getMorphoVaults_js_1 = require("./morpho/actions/vaults/getMorphoVaults.js");
const getMorphoVault_js_1 = require("./morpho/actions/vaults/getMorphoVault.js");
const getMorphoMarkets_js_1 = require("./morpho/actions/markets/getMorphoMarkets.js");
const getMorphoMarket_js_1 = require("./morpho/actions/markets/getMorphoMarket.js");
const getMorphoVaultUserPositions_js_1 = require("./morpho/actions/user-positions/getMorphoVaultUserPositions.js");
const getMorphoMarketUserPositions_js_1 = require("./morpho/actions/user-positions/getMorphoMarketUserPositions.js");
const getMorphoUserBalances_js_1 = require("./morpho/actions/getMorphoUserBalances.js");
(async () => {
    const vaults = await (0, getMorphoVaults_js_1.getMorphoVaults)({
        environments: [index_js_1.publicEnvironments.base, index_js_1.publicEnvironments.moonbeam],
        includeRewards: true
    });
    const vault = await (0, getMorphoVault_js_1.getMorphoVault)({
        environment: index_js_1.publicEnvironments.base,
        vault: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
        includeRewards: true
    });
    const markets = await (0, getMorphoMarkets_js_1.getMorphoMarkets)({
        environments: [index_js_1.publicEnvironments.base, index_js_1.publicEnvironments.moonbeam],
        includeRewards: true
    });
    const market = await (0, getMorphoMarket_js_1.getMorphoMarket)({
        environment: index_js_1.publicEnvironments.base,
        market: "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba",
        includeRewards: true
    });
    const userPositions = await (0, getMorphoVaultUserPositions_js_1.getMorphoVaultUserPositions)({
        environments: [index_js_1.publicEnvironments.base],
        account: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
    });
    const userPositionsMarkets = await (0, getMorphoMarketUserPositions_js_1.getMorphoMarketUserPositions)({
        environments: [index_js_1.publicEnvironments.base],
        account: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
        markets: ["0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda"],
    });
    const userBalances = await (0, getMorphoUserBalances_js_1.getMorphoUserBalances)({
        environments: [index_js_1.publicEnvironments.base],
        account: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
    });
    console.log(false && vaults?.[0]);
    console.log(false && vault);
    console.log(false && markets);
    console.log(false && market);
    console.log(false && userPositions);
    console.log(false && userPositionsMarkets);
    console.log(userBalances['8453']);
})();
//# sourceMappingURL=index.js.map