import { publicEnvironments } from "./environments/index.js";
import { getMorphoVaults } from "./morpho/actions/vaults/getMorphoVaults.js";
import { getMorphoVault } from "./morpho/actions/vaults/getMorphoVault.js";
import { getMorphoMarkets } from "./morpho/actions/markets/getMorphoMarkets.js";
import { getMorphoMarket } from "./morpho/actions/markets/getMorphoMarket.js";
import { getMorphoVaultUserPositions } from "./morpho/actions/user-positions/getMorphoVaultUserPositions.js";
import { getMorphoMarketUserPositions } from "./morpho/actions/user-positions/getMorphoMarketUserPositions.js";
import { getMorphoUserBalances } from "./morpho/actions/getMorphoUserBalances.js";
(async () => {
    const vaults = await getMorphoVaults({
        environments: [publicEnvironments.base, publicEnvironments.moonbeam],
        includeRewards: true
    });
    const vault = await getMorphoVault({
        environment: publicEnvironments.base,
        vault: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
        includeRewards: true
    });
    const markets = await getMorphoMarkets({
        environments: [publicEnvironments.base, publicEnvironments.moonbeam],
        includeRewards: true
    });
    const market = await getMorphoMarket({
        environment: publicEnvironments.base,
        market: "0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba",
        includeRewards: true
    });
    const userPositions = await getMorphoVaultUserPositions({
        environments: [publicEnvironments.base],
        account: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
    });
    const userPositionsMarkets = await getMorphoMarketUserPositions({
        environments: [publicEnvironments.base],
        account: "0xd7854FC91f16a58D67EC3644981160B6ca9C41B8",
        markets: ["0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda"],
    });
    const userBalances = await getMorphoUserBalances({
        environments: [publicEnvironments.base],
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